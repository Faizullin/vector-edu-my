from drf_standardized_errors.handler import exception_handler as standardized_exception_handler
from rest_framework.views import exception_handler as default_exception_handler
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class StandardizedViewMixin:
    def handle_exception(self, exc):
        response = standardized_exception_handler(exc, self.get_exception_handler_context())
        if response is None:
            return super().handle_exception(exc)
        return response