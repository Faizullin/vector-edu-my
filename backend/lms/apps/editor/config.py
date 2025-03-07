from django.conf import settings

# ATTACHMENT_REQUIRE_AUTHENTICATION = str(
#     getattr(settings, "EDITORJS_ATTACHMENT_REQUIRE_AUTHENTICATION", True)
# )

EMBED_HOSTNAME_ALLOWED = str(
    getattr(settings, "EDITORJS_EMBED_HOSTNAME_ALLOWED", (
        'player.vimeo.com',
        'www.youtube.com',
        'coub.com',
        'vine.co',
        'imgur.com',
        'gfycat.com',
        'player.twitch.tv',
        'player.twitch.tv',
        'music.yandex.ru',
        'codepen.io',
        'www.instagram.com',
        'twitframe.com',
        'assets.pinterest.com',
        'www.facebook.com',
        'www.aparat.com',
    ))
)

PLUGINS = getattr(
    settings, "EDITORJS_DEFAULT_PLUGINS", (
        '@editorjs/paragraph',
        '@editorjs/image',
        '@editorjs/header',
        '@editorjs/list',
        '@editorjs/checklist',
        '@editorjs/quote',
        '@editorjs/raw',
        '@editorjs/code',
        '@editorjs/inline-code',
        '@editorjs/embed',
        '@editorjs/delimiter',
        '@editorjs/warning',
        '@editorjs/link',
        '@editorjs/marker',
        '@editorjs/table',
    )
)

PLUGINS_KEYS = {
    '@editorjs/image': 'Image',
    '@editorjs/header': 'Header',
    '@editorjs/checklist': 'Checklist',
    '@editorjs/list': 'List',
    '@editorjs/quote': 'Quote',
    '@editorjs/raw': 'Raw',
    '@editorjs/code': 'Code',
    '@editorjs/inline-code': 'InlineCode',
    '@editorjs/embed': 'Embed',
    '@editorjs/delimiter': 'Delimiter',
    '@editorjs/warning': 'Warning',
    '@editorjs/link': 'LinkTool',
    '@editorjs/marker': 'Marker',
    '@editorjs/table': 'Table',
}
