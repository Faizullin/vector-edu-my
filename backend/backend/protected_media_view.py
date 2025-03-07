# -*- coding: utf-8 -*-
import mimetypes
import os
from os.path import basename

from django.http import HttpResponse
from django.urls import re_path
from django.views.static import serve
from protected_media.utils import server_header
from rest_framework.views import APIView

from .settings import PROTECTED_MEDIA_LOCATION_PREFIX, PROTECTED_MEDIA_ROOT
from .settings import PROTECTED_MEDIA_SERVER, PROTECTED_MEDIA_AS_DOWNLOADS


class DRFAuthProtectedMediaView(APIView):
    """
    View to serve protected media files that authenticates using DRF.
    """

    def get(self, request, path, server="django", as_download=False):
        if server != "django":
            mimetype, encoding = mimetypes.guess_type(path)
            response = HttpResponse()
            response["Content-Type"] = mimetype
            if encoding:
                response["Content-Encoding"] = encoding

            if as_download:
                response["Content-Disposition"] = "attachment; filename={}".format(
                    basename(path))

            response[server_header(server)] = os.path.join(
                PROTECTED_MEDIA_LOCATION_PREFIX, path
            ).encode("utf8")
        else:
            response = serve(
                request, path, document_root=PROTECTED_MEDIA_ROOT,
                show_indexes=False
            )

        return response


urlpatterns = [
    re_path(
        r"^(?P<path>.*)$", DRFAuthProtectedMediaView.as_view(), {
            "server": PROTECTED_MEDIA_SERVER,
            "as_download": PROTECTED_MEDIA_AS_DOWNLOADS
        }
    ),
]
