import { BlueCardComponentTool } from './blueCardComponentTool';
import { TextProComponentTool } from '@/views/resources/posts/edit-content/tools/textProComponent';
import { AudioComponentTool } from '@/views/resources/posts/edit-content/tools/audioComponentTool';
import { VideoComponentTool } from './videoComponentTool';
import { ImageComponentTool } from './imageComponentTool';
import { QuestionComponentTool } from './questionComponentTool';
import { FillTextComponentTool } from './fillTextComponentTool';
import { RecordAudioComponentTool } from '@/views/resources/posts/edit-content/tools/recordAudioComponent';
import { PutInOrderComponentTool } from '@/views/resources/posts/edit-content/tools/orderComponentTool';
import { MatchingComponentTool } from '@/views/resources/posts/edit-content/tools/matchingComponentTool';

export const getTools = (actionsApi) => {
  const defaultConfig = {
    getActionsApi: () => {
      return actionsApi;
    }
  };
  return {
    // header: {
    //   class: EditorHeader,
    //   inlineToolbar: ['marker', 'link'],
    //   config: {
    //     placeholder: 'Header'
    //   }
    // },
    audioComponent: {
      class: AudioComponentTool,
      inlineToolbar: false,
      config: {
        ...defaultConfig
      }
    },
    blueCardComponent: {
      class: BlueCardComponentTool,
      inlineToolbar: false,
      config: {
        ...defaultConfig
      }
    },
    // paragraph: {
    //   class: Paragraph,
    //   inlineToolbar: true,
    //   config: {
    //     ...defaultConfig,
    //     preserveBlank: true
    //   }
    // },
    paragraph: {
      class: TextProComponentTool,
      inlineToolbar: true,
      config: {
        ...defaultConfig,
        preserveBlank: true
      }
    },
    fillTextComponent: {
      class: FillTextComponentTool,
      inlineToolbar: false,
      config: {
        ...defaultConfig
      }
    },
    imageComponent: {
      class: ImageComponentTool,
      inlineToolbar: false,
      config: {
        ...defaultConfig
      }
    },
    matchingComponent: {
      class: MatchingComponentTool,
      inlineToolbar: false,
      config: {
        ...defaultConfig
      }
    },
    putInOrderComponent: {
      class: PutInOrderComponentTool,
      inlineToolbar: false,
      config: {
        ...defaultConfig
      }
    },
    questionComponent: {
      class: QuestionComponentTool,
      inlineToolbar: false,
      config: {
        ...defaultConfig
      }
    },
    recordAudioComponent: {
      class: RecordAudioComponentTool,
      inlineToolbar: false,
      config: {
        ...defaultConfig
      }
    },
    videoComponent: {
      class: VideoComponentTool,
      inlineToolbar: false,
      config: {
        ...defaultConfig
      }
    }
    // paragraph: {
    //   class: TextComponentTool,
    //   inlineToolbar: true,
    //   config: {
    //     preserveBlank: true
    //   }
    // }
    // table: {
    //   class: Table,
    //   inlineToolbar: true,
    //   config: {
    //     defaultStyle: 'ordered'
    //   }
    // },
    // list: {
    //   class: NestedList,
    //   inlineToolbar: true
    // },
    // quote: {
    //   class: Quote,
    //   inlineToolbar: true,
    //   config: {
    //     quotePlaceholder: 'Enter a quote',
    //     captionPlaceholder: "Quote's author"
    //   }
    // },
    // checklist: {
    //   class: Checklist,
    //   inlineToolbar: true
    // },
    // marker: {
    //   class: Marker
    // },
    // code: {
    //   class: CodeTool
    // },
    // delimiter: Delimiter,
    // inlineCode: {
    //   class: InlineCode
    // },
    // linkTool: LinkTool,
    //
    // embed: {
    //   class: Embed,
    //   inlineToolbar: false,
    //   config: {
    //     services: {
    //       youtube: {
    //         regex:
    //           /(?:https?:\/\/)?(?:www\.)?(?:(?:youtu\.be\/)|(?:youtube\.com)\/(?:v\/|u\/\w\/|embed\/|watch))(?:(?:\?v=)?([^#&?=]*))?((?:[?&]\w*=\w*)*)/,
    //         embedUrl: 'https://www.youtube.com/embed/<%= remote_id %>',
    //         html: '<iframe style="width:100%; height: 30rem;" frameborder="0" allowfullscreen></iframe>',
    //         height: 320,
    //         width: 580,
    //         id: ([id, params]) => {
    //           if (!params && id) {
    //             return id;
    //           }
    //
    //           const paramsMap = {
    //             start: 'start',
    //             end: 'end',
    //             t: 'start',
    //             time_continue: 'start',
    //             list: 'list'
    //           };
    //
    //           let newParams = params
    //             .slice(1)
    //             .split('&')
    //             .map((param) => {
    //               const [name, value] = param.split('=');
    //
    //               if (!id && name === 'v') {
    //                 id = value;
    //
    //                 return null;
    //               }
    //
    //               if (!paramsMap[name]) {
    //                 return null;
    //               }
    //
    //               if (value === 'LL' || value.startsWith('RDMM') || value.startsWith('FL')) {
    //                 return null;
    //               }
    //
    //               return `${paramsMap[name]}=${value}`;
    //             })
    //             .filter((param) => !!param);
    //
    //           return id + '?' + newParams.join('&');
    //         }
    //       },
    //       vimeo: true,
    //       // codepen: true,
    //       // github: true,
    //       // slides: {
    //       //   regex: /https:\/\/docs\.google\.com\/presentation\/d\/([A-Za-z0-9_-]+)\/pub/,
    //       //   embedUrl: 'https://docs.google.com/presentation/d/<%= remote_id %>/embed',
    //       //   html: "<iframe style='width: 100%; height: 30rem; border: 1px solid #D3D3D3; border-radius: 12px; margin: 1rem 0' frameborder='0' allowfullscreen='true'></iframe>"
    //       // },
    //       drive: {
    //         regex: /https:\/\/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)\/view(\?.+)?/,
    //         embedUrl: 'https://drive.google.com/file/d/<%= remote_id %>/preview',
    //         html: "<iframe style='width: 100%; height: 25rem; border: 1px solid #D3D3D3; border-radius: 12px;' frameborder='0' allowfullscreen='true'></iframe>"
    //       }
    //       // docsPublic: {
    //       //   regex: /https:\/\/docs\.google\.com\/document\/d\/([A-Za-z0-9_-]+)\/edit(\?.+)?/,
    //       //   embedUrl: 'https://docs.google.com/document/d/<%= remote_id %>/preview',
    //       //   html: "<iframe style='width: 100%; height: 40rem; border: 1px solid #D3D3D3; border-radius: 12px;' frameborder='0' allowfullscreen='true'></iframe>"
    //       // },
    //       // sheetsPublic: {
    //       //   regex: /https:\/\/docs\.google\.com\/spreadsheets\/d\/([A-Za-z0-9_-]+)\/edit(\?.+)?/,
    //       //   embedUrl: 'https://docs.google.com/spreadsheets/d/<%= remote_id %>/preview',
    //       //   html: "<iframe style='width: 100%; height: 40rem; border: 1px solid #D3D3D3; border-radius: 12px;' frameborder='0' allowfullscreen='true'></iframe>"
    //       // },
    //       // slidesPublic: {
    //       //   regex: /https:\/\/docs\.google\.com\/presentation\/d\/([A-Za-z0-9_-]+)\/edit(\?.+)?/,
    //       //   embedUrl: 'https://docs.google.com/presentation/d/<%= remote_id %>/embed',
    //       //   html: "<iframe style='width: 100%; height: 30rem; border: 1px solid #D3D3D3; border-radius: 12px; margin: 1rem 0;' frameborder='0' allowfullscreen='true'></iframe>"
    //       // },
    //       // codesandbox: {
    //       //   regex: /^https:\/\/codesandbox\.io\/(?:embed\/)?([A-Za-z0-9_-]+)(?:\?[^\/]*)?$/,
    //       //   embedUrl: 'https://codesandbox.io/embed/<%= remote_id %>?view=editor+%2B+preview&module=%2Findex.html',
    //       //   html: "<iframe style='width: 100%; height: 500px; border: 0; border-radius: 4px; overflow: hidden;' sandbox='allow-mods allow-forms allow-popups allow-scripts allow-same-origin' frameborder='0' allowfullscreen='true'></iframe>"
    //       // }
    //     }
    //   }
    // }
  };
};
