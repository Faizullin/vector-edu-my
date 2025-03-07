from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from protected_media import urls
from . import protected_media_view
 
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api_lessons/', include('api_lessons.urls')),
    path('api_am/', include('api_additional_materials.urls')),
    path('api_users/', include('api_users.urls')),
    path('api_dc/', include('api_data_collection.urls')),
    path('api_ge/', include('api_global_event.urls')),
    path('protected/', include(protected_media_view)),
]

urlpatterns += [
    path('', include('lms.urls', namespace='lms')),
]
if settings.DEBUG_MODE:    
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    
    from debug_toolbar.toolbar import debug_toolbar_urls
    urlpatterns += debug_toolbar_urls()