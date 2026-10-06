import sanitizeHtml from 'sanitize-html';

// Generated HTML is untrusted. Strip scripts, handlers, forms posting out, external resources.
export function sanitizeScreen(html: string): string {
  const clean = sanitizeHtml(html, {
    allowedTags: ['div','section','header','footer','main','nav','article','aside','h1','h2','h3','h4','p','span','a','ul','ol','li','button','input','label','textarea','select','option','img','svg','path','circle','rect','line','strong','em','small','br','hr','form','table','thead','tbody','tr','th','td','style'],
    allowedAttributes: { '*': ['style','class','aria-label','role','type','placeholder','alt','width','height','viewBox','d','fill','stroke','cx','cy','r','x','y','x1','x2','y1','y2'], a: ['href'], img: ['src','alt'] },
    allowedSchemes: ['data'],
    allowedSchemesByTag: { img: ['data'], a: [] },
    allowProtocolRelative: false,
    transformTags: { a: (_t, a) => ({ tagName: 'a', attribs: { href: '#' } }), form: (_t) => ({ tagName: 'div', attribs: {} }) },
    allowVulnerableTags: true, // <style> is allowed; scripts are not, and the iframe is sandboxed with no scripts
    parser: { lowerCaseTags: true },
  });
  // No external loads via CSS. The iframe CSP (PreviewFrame) is the backstop for escaped variants.
  return clean.replace(/@import[^;<]*;?/gi, '').replace(/url\s*\([^)]*\)/gi, 'none');
}
