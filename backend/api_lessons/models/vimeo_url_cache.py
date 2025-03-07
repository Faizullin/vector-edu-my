import requests
from django.db import models
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from backend.settings import VIMEO_ACCESS_TOKEN


class VimeoUrlCacheModel(models.Model):
    vimeo_link = models.URLField(verbose_name='Ссылка на видео', max_length=1024)
    playable_video_link = models.URLField(verbose_name='Ссылка на видеофайл', max_length=1024)
    expire_time = models.DateTimeField(verbose_name='Время истечения ссылки')

    class Meta:
        verbose_name = 'Кэш ссылок Vimeo'
        verbose_name_plural = 'Кэш ссылок Vimeo'


def get_video_link_from_vimeo(vimeo_link):
    now = timezone.now() - timezone.timedelta(hours=1)
    cached_video = VimeoUrlCacheModel.objects.filter(vimeo_link=vimeo_link, expire_time__gt=now).first()
    if cached_video:
        return cached_video.playable_video_link

    video_id = vimeo_link.split('/')[-1]
    headers = {'Authorization': 'Bearer ' + VIMEO_ACCESS_TOKEN}
    response = requests.get(f'https://api.vimeo.com/videos/{video_id}?fields=play', headers=headers)
    if not response.json().get('play', False):
        return 'https://dummylink.dummy'
    progressive = response.json()['play']['progressive']
    video = [video for video in progressive if video['rendition'] == '1080p'][0]

    expire_time = parse_datetime(video['link_expiration_time'])
    video_link = video['link']
    VimeoUrlCacheModel.objects.create(vimeo_link=vimeo_link, playable_video_link=video_link, expire_time=expire_time)
    return video_link
