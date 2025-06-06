from api_lessons.models.lesson_components.matching_component import (
    MatchingComponentElement,
)


def getUid(comonentId):
    """
    This function takes a component ID and returns a unique identifier (UID) for it.
    The UID is generated by replacing the first character of the component ID with 'u'.
    """
    return "elem" + str(comonentId)


def components_elements_qs(component_obj):
    """
    This function takes a MatchingComponent object and returns a list of dictionaries,
    each containing the ID and name of an element in the component.
    """
    couples = component_obj.element_couples.all()
    used_element_ids = set(
        [c.first_element_id for c in couples] + [c.second_element_id for c in couples]
    )
    return MatchingComponentElement.objects.all().filter(pk__in=used_element_ids)
