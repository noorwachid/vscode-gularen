const document = {
    name: 'Gularen',
    scopeName: 'source.gularen',
    patterns: [
        {
            include: '#block'
        }
    ],
    repository: {
        block: {
            patterns: [
                {
                    include: '#blockcomment'
                },
                {
                    include: '#heading'
                },
                {
                    include: '#blockquote'
                },
                {
                    include: '#admon'
                },
                {
                    include: '#list'
                },
                {
                    include: '#code'
                },
                {
                    include: '#paragraph'
                },
                {
                    include: '#thematic_break'
                },
            ]
        },
        heading: {
            name: 'markup.heading.gularen',
            match: '^\\s*>{1,3} .*$',
            captures: {
                '0': { 
                    patterns: [
                        {
                            name: 'heading.1.gularen',
                            match: '^\\s*(>{3}) (.*)$',
                            captures: {
                                '1': { name: 'punctuation.definition.heading.gularen' },
                                '2': { name: 'entity.name.section.gularen' }
                            }
                        },
                        {
                            name: 'heading.2.gularen',
                            match: '^\\s*(>{2}) (.*)$',
                            captures: {
                                '1': { name: 'punctuation.definition.heading.gularen' },
                                '2': { name: 'entity.name.section.gularen' }
                            }
                        },
                        {
                            name: 'heading.3.gularen',
                            match: '^\\s*(>{1}) (.*)$',
                            captures: {
                                '1': { name: 'punctuation.definition.heading.gularen' },
                                '2': { name: 'entity.name.section.gularen' }
                            }
                        }
                    ]
                }
            }
        },
        blockquote: {
            name: 'markup.quote.gularen',
            begin: '^\\s*(/ )',
            while: '^\\s*(/ )',
            captures: {
                '1': { name: 'punctuation.definition.quote.begin.gularen' }
            }
        },
        admon: {
            name: 'entity.name.function.gularen',
            match: '^\\s*<[A-Za-z][^>]+>'
        },
        paragraph: {
            name: 'meta.paragraph.gularen',
            begin: '^\\s*[A-Za-z0-9\\*_`=~\\^]',
            while: '^\\s*[A-Za-z0-9\\*_`=~\\^]',
            patterns: [
                {
                    include: '#inline'
                }
            ]
        },
        list: {
            patterns: [
                {
                    name: 'punctuation.definition.list.begin.markdown',
                    match: '^\\s*- '
                },
                {
                    name: 'punctuation.definition.list.begin.markdown',
                    match: '^\\s*[0-9]+\\. '
                },
                {
                    match: '^\\s*\\[(x)\\] ',
                    captures: { '1': { name: 'markup.inserted.diff' } }
                },
            ]
        },
        code: {
            patterns: []
        },
        codeUnknown: {
            name: 'markup.fenced_code.block.gularen',
            begin: '^(\\s*)(-{3,})( ([a-z0-9-_ ]+))?$',
            beginCaptures: {
                '2': {
                    name: 'punctuation.definition.gularen'
                },
                '4': {
                    name: 'fenced_code.block.language'
                }
            },
            end: '^(\\1)(\\2)$',
            endCaptures: {
                '2': {
                    name: 'punctuation.definition.gularen'
                }
            }
        },
        thematicBreak: {
            name: 'markup.deleted.diff',
            match: '^\\s*\\*{3}$'
        },
        blockcomment: {
            name: 'comment.inline.gularen',
            match: '^~.*$'
        },

        inline: {
            patterns: [
                {
                    include: '#comment'
                },
                {
                    include: '#bold'
                },
                {
                    include: '#italic'
                },
                {
                    include: '#highlight'
                },
                {
                    include: '#inlineCode'
                },
                {
                    include: '#datetime'
                },
                {
                    include: '#break'
                },
                {
                    include: '#reference'
                }
            ]
        },

        comment: {
            name: 'comment.inline.gularen',
            match: '~.*$'
        },
        bold: {
            name: 'markup.bold.gularen',
            begin: '\\*',
            end: '\\*',
            patterns: [
                {
                    include: '#italic'
                },
                {
                    include: '#highlight'
                }
            ]
        },
        italic: {
            name: 'markup.italic.gularen',
            begin: '_',
            end: '_',
            patterns: [
                {
                    include: '#bold'
                },
                {
                    include: '#highlight'
                }
            ]
        },
        highlight: {
            name: 'markup.inline.highlight',
            begin: '=',
            end: '=',
            patterns: [
                {
                    include: '#bold'
                },
                {
                    include: '#italic'
                }
            ]
        },

        inlineCode: {
            name: 'markup.inline.raw.string.gularen',
            begin: '`',
            end: '`'
        },
        break: {
            name: 'markup.deleted.diff',
            match: '<{1,3}'
        },

        datetime: {
            name: 'variable.other.readwrite.gularen',
            match: '<\\d{4}-\\d{2}-\\d{2}( \\d{2}:\\d{2}(:\\d{2})?)?>'
        },

        reference: {
            name: 'meta.link.inline.gularen',
            match: '\\[([^\\]]*)\\](?:\\(([^\\)]*)\\))?',
            captures: {
                '1': { name: 'markup.underline.link.gularen' },
                '2': { name: 'string.other.link.title.gularen' }
            }
        }
    }
};

function addCode(id, alias = [], source = null) {
    const link = `code_${id}`;
    const pattern = [id, ...alias].join('|');
    const include = source ?? `source.${id}`;

    document.repository[link] = {
        name: 'markup.fenced_code.block.gularen',
        begin: `^(\\s*)(-{3,}) (${pattern})($| [a-zA-Z0-9-_ ]+$)`,
        beginCaptures: {
            '2': { name: 'punctuation.definition.gularen' },
            '4': { name: 'fenced_code.block.language' }
        },
        end: '^(\\1)(\\2)$',
        endCaptures: {
            '2': {
                name: 'punctuation.definition.gularen'
            }
        },
        patterns: [
            {
                begin: '^(?!\\s*-{3,}$)',
                while: '^(?!\\s*-{3,}$)',
                contentName: `meta.embedded.block.${id}`,
                patterns: [
                    {
                        include: include,
                    }
                ]
            }
        ]
    };
    document.repository.code.patterns.push({
        include: `#${link}`
    })
}

addCode('c');
addCode('clojure');
addCode('coffee');
addCode('cpp');
addCode('csharp');
addCode('css');
addCode('diff');
addCode('dockerfile');
addCode('dosbatch');
addCode('fsharp');
addCode('go');
addCode('groovy');
addCode('ini');
addCode('java');
addCode('js');
addCode('jsx')
addCode('json');
addCode('jsonc');
addCode('latex', ['tex'], 'text.tex.latex');
addCode('less');
addCode('lua');
addCode('makefile');
addCode('mermaid');
addCode('objc');
addCode('perl');
addCode('php');
addCode('python');
addCode('r');
addCode('ruby');
addCode('rust', ['rs']);
addCode('scala');
addCode('scss');
addCode('sh', ['bash', 'zsh']);
addCode('sql');
addCode('ts');
addCode('tsx');
addCode('xml', [], 'text.html');
addCode('yaml');

document.repository.code.patterns.push({
    include: '#codeUnknown'
})

console.log(JSON.stringify(document));