import urllib.parse

from django.utils.module_loading import import_string


def get_storage_class():
    return import_string('django.core.files.storage.DefaultStorage')()


def get_hostname_from_url(url):
    obj_url = urllib.parse.urlsplit(url)
    return obj_url.hostname


storage = get_storage_class()
