import DOMPurify from 'dompurify';

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener noreferrer');
    }
});

export const sanitizeDescription = (source: string) => {
    return DOMPurify.sanitize(source, {
        ALLOWED_TAGS: ['a', 'b', 'em', 'br', 'i', 'u', 'ul', 'ol', 'li', 'span', 'p'],
        ALLOWED_ATTR: ['href'],
    });
};

export const stripAllTags = (source: string) => {
    const html = sanitizeDescription(source);
    const div = document.createElement('DIV');
    div.style.whiteSpace = 'pre-wrap';
    div.innerHTML = html;
    // Append it to force a layout pass so that innerText returns newlines
    document.body.appendChild(div);
    const result = div.innerText;
    document.body.removeChild(div);
    return result;
};

// for ms teams invites that contain links like <https://example.com/>
export const buildMSTeamsLinks = (input: string) => {
    return input.replace(
        /(<((http:|https:|mailto:)\S*)>)/gm,
        (fullMatch, match1, match2) => `&lt;<a href=${match2}>${match2}</a>&gt;;`
    );
};
