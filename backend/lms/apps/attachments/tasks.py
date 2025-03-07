import logging
import os
from pathlib import Path

from celery import shared_task
from django.apps import apps
from django.core.files.storage import default_storage
from django.db.models import FileField
from django.db.models import Q

logger = logging.getLogger("celery")


def walk_folder(storage, base="/", error_handler=None):
    """
    Recursively walks a folder, using Django's File Storage.
    :param storage: <Storage>
    :param base: <str> The base folder
    :param error_handler: <callable>
    :yields: A tuple of base, subfolders, files
    """
    try:
        folders, files = storage.listdir(base)
    except OSError as e:
        logger.exception("An error occurred while walking directory %s", base)
        if error_handler:
            error_handler(e)
        return

    for subfolder in folders:
        # On S3, we don't really have subfolders, so exclude "."
        if subfolder == ".":
            continue

        new_base = str(Path(base, subfolder))
        for f in walk_folder(storage, new_base):
            yield f

    yield base, folders, files


def delete_unused_files(root_path):
    all_models = apps.get_models()
    all_filepath_list = set()
    used_filepath_list = set()
    for model_item in all_models:
        file_fields = []
        filters = Q()
        for f_ in model_item._meta.fields:
            if isinstance(f_, FileField):
                file_fields.append(f_.name)
                is_null = {'{}__isnull'.format(f_.name): True}
                is_empty = {'{}__exact'.format(f_.name): ''}
                filters &= Q(**is_null) | Q(**is_empty)
        # only retrieve the models which have non-empty, non-null file fields
        if file_fields:
            files = model_item.objects.exclude(filters).values_list(*file_fields, flat=True).distinct()
            used_filepath_list.update(files)

    for base, subfolders, files in walk_folder(default_storage, root_path):
        for file in files:
            file_path = os.path.join(base, file).replace("\\", "/")
            all_filepath_list.add(file_path)

    unused_filepath_list = all_filepath_list - used_filepath_list

    print(f"used: {len(used_filepath_list)}, unused: {len(unused_filepath_list)}(will be deleted)")
    for i in unused_filepath_list:
        default_storage.delete(i)


@shared_task()
def cleanup_task():
    logger = logging.getLogger("celery")
    print("Start cleaning up task", logger.handlers)
    delete_unused_files(root_path="")
    print("Stop cleaning up task")
