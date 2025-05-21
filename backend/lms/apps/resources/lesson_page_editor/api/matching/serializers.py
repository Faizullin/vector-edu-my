from django.db import transaction
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from api_lessons.models.lesson_components.matching_component import (
    MatchingComponent,
    MatchingComponentElement,
    MatchingComponentElementCouple,
)
from .utils import getUid


# ─────────────────────────────  HELPERS  ──────────────────────────────
def _uid(pk: int) -> str:
    return getUid(pk)


def _build_representation(component: MatchingComponent) -> dict:
    """
    Shared read-side formatter for list / detail responses.
    """
    couples_qs = component.element_couples.all().select_related(
        "first_element", "second_element"
    )

    elem_map = {}
    for c in couples_qs:
        elem_map[_uid(c.first_element_id)] = c.first_element
        elem_map[_uid(c.second_element_id)] = c.second_element

    return {
        "id": component.id,
        "title": component.title,
        "elements": [
            {
                "id": e.id,
                "uid": _uid(e.id),
                "text": e.text,
                "image_file": e.image.url if e.image else None,
            }
            for e in elem_map.values()
        ],
        "couples": [
            {
                "first_element": _uid(c.first_element_id),
                "second_element": _uid(c.second_element_id),
            }
            for c in couples_qs
        ],
    }


# ─────────────────────────────  READ-ONLY  ─────────────────────────────
class MatchingComponentElementRO(serializers.ModelSerializer):
    uid = serializers.SerializerMethodField()

    class Meta:
        model = MatchingComponentElement
        fields = ("id", "uid", "text", "image")

    def get_uid(self, obj):
        return _uid(obj.id)


class MatchingComponentListSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchingComponent
        fields = ("id", "title")


class MatchingComponentDetailSerializer(serializers.Serializer):
    def to_representation(self, instance):
        return _build_representation(instance)


# ─────────────────────────────  WRITE SCHEMAS  ─────────────────────────
class MatchingElementInput(serializers.Serializer):
    """
    • **uid** (required) – client-side key (string)
    • **id** (optional) – existing element PK when updating
    """

    uid = serializers.CharField()
    id = serializers.IntegerField(required=False)
    text = serializers.CharField(required=False, allow_blank=True)
    image_file = serializers.ImageField(required=False)

    def validate(self, attrs):
        if not attrs.get("uid"):
            raise ValidationError(_("Element uid is required."))
        return attrs


class MatchingCoupleInput(serializers.Serializer):
    first_element = serializers.CharField()
    second_element = serializers.CharField()


# ─────────────────────────  CREATE / UPDATE  ──────────────────────────
class MatchingComponentCreateUpdateSerializer(serializers.ModelSerializer):
    elements = MatchingElementInput(many=True, write_only=True)
    couples = MatchingCoupleInput(many=True, write_only=True)

    class Meta:
        model = MatchingComponent
        fields = ("id", "title", "elements", "couples")

    # ----------  internal helpers ----------
    def _get_or_create_elements(self, elements_data):
        """
        Returns a dict  { uid ➜ MatchingComponentElement instance }
        New objects are bulk-created; existing objects are updated in-place.
        """
        new_instances = []
        uid_map = {}

        for elem in elements_data:
            uid = elem["uid"]  # always present
            instance = None

            # existing element?
            if elem.get("id"):
                try:
                    instance = MatchingComponentElement.objects.get(pk=elem["id"])
                except MatchingComponentElement.DoesNotExist:
                    raise ValidationError(_(f"Element id {elem['id']} not found"))
                if "text" in elem:
                    instance.text = elem["text"]
                if "image_file" in elem:
                    instance.image = elem["image_file"]
            else:
                # new element (save later)
                instance = MatchingComponentElement(
                    text=elem.get("text", ""),
                    image=elem.get("image_file"),
                )
                new_instances.append(instance)

            uid_map[uid] = instance

        # create new elements in bulk
        if new_instances:
            MatchingComponentElement.objects.bulk_create(new_instances)

        return uid_map

    def _sync_couples(self, component, couples_data, uid_map):
        """
        Synchronise couples to match `couples_data`.
        Element references **must** point to keys present in `uid_map`.
        """
        desired_pairs = set()
        for c in couples_data:
            try:
                first = uid_map[c["first_element"]].id
                second = uid_map[c["second_element"]].id
            except KeyError as k:
                raise ValidationError(_(f"Couple references unknown uid: {k.args[0]}"))
            desired_pairs.add((first, second))

        current_pairs = {
            (c.first_element_id, c.second_element_id): c.id
            for c in component.element_couples.all().only(
                "id", "first_element_id", "second_element_id"
            )
        }

        # delete couples no longer wanted
        stale_ids = [
            cid for pair, cid in current_pairs.items() if pair not in desired_pairs
        ]
        if stale_ids:
            MatchingComponentElementCouple.objects.filter(id__in=stale_ids).delete()

        # add new couples
        new_objs = [
            MatchingComponentElementCouple(
                component=component,
                first_element_id=p[0],
                second_element_id=p[1],
            )
            for p in desired_pairs
            if p not in current_pairs
        ]
        if new_objs:
            MatchingComponentElementCouple.objects.bulk_create(new_objs)

    # ----------  create ----------
    @transaction.atomic
    def create(self, validated_data):
        elems_in = validated_data.pop("elements")
        couples_in = validated_data.pop("couples")

        component = MatchingComponent.objects.create(title=validated_data["title"])
        uid_map = self._get_or_create_elements(elems_in)
        self._sync_couples(component, couples_in, uid_map)
        return component

    # ----------  update ----------
    @transaction.atomic
    def update(self, instance, validated_data):
        instance.title = validated_data.get("title", instance.title)

        elems_in = validated_data.pop("elements", [])
        couples_in = validated_data.pop("couples", [])

        uid_map = self._get_or_create_elements(elems_in)
        self._sync_couples(instance, couples_in, uid_map)

        instance.save()
        return instance

    # ----------  out ----------
    def to_representation(self, instance):
        return _build_representation(instance)
