import { NewsletterBlock, NewsletterSettings } from './types';

export const exportToHtml = (blocks: NewsletterBlock[], settings: NewsletterSettings): string => {
  const fontStack = {
    'Poppins': "'Poppins', sans-serif",
    'Helvetica': '"Helvetica Neue", Helvetica, Arial, sans-serif',
    'Open Sans': "'Open Sans', sans-serif",
    'Montserrat': "'Montserrat', sans-serif",
    'Inter': "'Inter', sans-serif",
    'sans-serif': "sans-serif"
  }[settings.fontFamily];

  const getBlockStyle = (block: NewsletterBlock) => {
    const styles = [];
    if (block.backgroundColor) styles.push(`background-color: ${block.backgroundColor}`);
    if (block.borderColor) styles.push(`border: ${block.borderWidth || 0}px solid ${block.borderColor}`);
    if (block.borderRadius) styles.push(`border-radius: ${block.borderRadius}px`);
    return styles.join('; ');
  };

  const renderBlock = (block: NewsletterBlock) => {
    switch (block.type) {
      case 'text': {
        const d = block.data;
        return `
          <tr>
            <td align="${d.textAlign}" valign="${d.verticalAlign === 'center' ? 'middle' : (d.verticalAlign || 'top')}" style="padding: ${d.paddingTop ?? 0}px ${d.paddingRight ?? 20}px ${d.paddingBottom ?? 0}px ${d.paddingLeft ?? 20}px; font-family: ${fontStack}; font-size: ${d.fontSize}px; color: ${d.color}; font-weight: ${d.fontWeight}; font-style: ${d.fontStyle}; line-height: 1.5; ${getBlockStyle(block)}">
              ${d.content}
            </td>
          </tr>
        `;
      }
      case 'image': {
        const d = block.data;
        const heightStyle = d.height ? `height: ${d.height}px; object-fit: cover;` : 'height: auto;';
        const imgHtml = `<img src="${d.url}" alt="${d.alt}" width="${d.width}%" style="display: block; width: ${d.width}%; max-width: 100%; border-radius: ${d.borderRadius}px; ${heightStyle}" />`;
        return `
          <tr>
            <td align="center" valign="${d.verticalAlign === 'center' ? 'middle' : (d.verticalAlign || 'top')}" style="padding: ${d.paddingTop ?? 0}px ${d.paddingRight ?? 20}px ${d.paddingBottom ?? 0}px ${d.paddingLeft ?? 20}px; ${getBlockStyle(block)}">
              ${d.linkUrl ? `<a href="${d.linkUrl}" target="_blank" style="text-decoration: none;">${imgHtml}</a>` : imgHtml}
            </td>
          </tr>
        `;
      }
      case 'divider': {
        const d = block.data;
        return `
          <tr>
            <td style="padding: ${d.paddingY}px ${d.paddingRight ?? 20}px ${d.paddingY}px ${d.paddingLeft ?? 20}px; ${getBlockStyle(block)}">
              <hr style="border: 0; border-top: ${d.thickness}px solid ${d.color}; margin: 0;" />
            </td>
          </tr>
        `;
      }
      case 'icon': {
        const d = block.data;
        const sizeMap = { small: 24, medium: 48, large: 64 };
        const size = sizeMap[d.size as keyof typeof sizeMap] || 48;
        const padding = d.isCircular ? size / 2 : 0;
        return `
          <tr>
            <td align="center" valign="${d.verticalAlign === 'center' ? 'middle' : (d.verticalAlign || 'top')}" style="padding: ${d.paddingTop ?? 0}px ${d.paddingRight ?? 20}px ${d.paddingBottom ?? 0}px ${d.paddingLeft ?? 20}px; ${getBlockStyle(block)}">
              <div style="display: inline-block; background-color: ${d.backgroundColor}; border-radius: ${d.isCircular ? '50%' : '8px'}; padding: ${d.isCircular ? padding / 2 : 12}px; width: ${size}px; height: ${size}px; line-height: ${size}px; text-align: center;">
                <span class="material-symbols-outlined" style="color: ${d.color}; font-size: ${size}px; line-height: ${size}px; display: block;">${d.iconName || 'star'}</span>
              </div>
            </td>
          </tr>
        `;
      }
      case 'button': {
        const d = block.data;
        const isLink = d.variant === 'link';
        const bgColor = isLink ? 'transparent' : d.backgroundColor;
        const textColor = isLink ? '#3b82f6' : d.color;
        const textDecoration = isLink ? 'underline' : 'none';
        const padding = isLink ? '4px 0' : `${d.paddingY}px ${d.paddingX}px`;
        const border = isLink ? 'none' : `1px solid ${d.backgroundColor}`;
        
        const iconHtml = d.iconName ? `<span class="material-symbols-outlined" style="font-size: ${d.fontSize}px; vertical-align: middle; margin-right: ${d.iconGap || 8}px; line-height: 1;">${d.iconName}</span>` : '';

        return `
          <tr>
            <td align="${d.textAlign}" valign="${d.verticalAlign === 'center' ? 'middle' : (d.verticalAlign || 'top')}" style="padding: ${d.paddingTop ?? 0}px ${d.paddingRight ?? 20}px ${d.paddingBottom ?? 0}px ${d.paddingLeft ?? 20}px; ${getBlockStyle(block)}">
              <table border="0" cellspacing="0" cellpadding="0" width="${d.fullWidth ? '100%' : 'auto'}">
                <tr>
                  <td align="center" bgcolor="${bgColor}" style="border-radius: ${d.borderRadius}px;">
                    <a href="${d.url}" target="_blank" style="font-family: ${fontStack}; font-size: ${d.fontSize}px; color: ${textColor}; text-decoration: ${textDecoration}; border-radius: ${d.borderRadius}px; padding: ${padding}; border: ${border}; display: inline-block; font-weight: bold; line-height: 1;">
                      ${iconHtml}${d.text}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        `;
      }
      case 'emoji': {
        const d = block.data;
        return `
          <tr>
            <td align="${d.textAlign}" valign="${d.verticalAlign === 'center' ? 'middle' : (d.verticalAlign || 'top')}" style="padding: ${d.paddingTop ?? 0}px ${d.paddingRight ?? 20}px ${d.paddingBottom ?? 0}px ${d.paddingLeft ?? 20}px; font-size: ${d.fontSize}px; line-height: 1; ${getBlockStyle(block)}">
              ${d.emoji || '😊'}
            </td>
          </tr>
        `;
      }
      case 'flex-row': {
        const d = block.data;
        const cells = d.items.map((item: any) => {
          let content = '';
          if (item.type === 'text') {
            const td = item.data;
            content = `<div style="font-family: ${fontStack}; font-size: ${td.fontSize || 14}px; color: ${td.color || '#334155'}; text-align: ${td.textAlign || 'left'}; font-weight: ${td.fontWeight || 'normal'}; font-style: ${td.fontStyle || 'normal'};">${td.content || ''}</div>`;
          } else if (item.type === 'image') {
            const id = item.data;
            const heightStyle = id.height ? `height: ${id.height}px; object-fit: cover;` : 'height: auto;';
            const imgHtml = id.url ? `<img src="${id.url}" alt="${id.alt}" width="${id.width || 100}%" style="display: block; width: ${id.width || 100}%; border-radius: ${id.borderRadius || 0}px; ${heightStyle}" />` : '';
            content = id.linkUrl ? `<a href="${id.linkUrl}" target="_blank" style="text-decoration: none;">${imgHtml}</a>` : imgHtml;
          } else if (item.type === 'icon') {
            const id = item.data;
            const sizeMap = { small: 24, medium: 48, large: 64 };
            const size = sizeMap[id.size as keyof typeof sizeMap] || 24;
            const padding = id.isCircular ? size / 2 : 0;
            content = `
              <div style="display: inline-block; background-color: ${id.backgroundColor || '#ffffff'}; border-radius: ${id.isCircular ? '50%' : '8px'}; padding: ${id.isCircular ? padding / 2 : 8}px; width: ${size}px; height: ${size}px; line-height: ${size}px; text-align: center;">
                <span class="material-symbols-outlined" style="color: ${id.color || '#3b82f6'}; font-size: ${size}px; line-height: ${size}px; display: block;">${id.iconName || 'star'}</span>
              </div>
            `;
          } else if (item.type === 'button') {
            const bd = item.data;
            const isLink = bd.variant === 'link';
            const bgColor = isLink ? 'transparent' : (bd.backgroundColor || '#3b82f6');
            const textColor = isLink ? '#3b82f6' : (bd.color || '#ffffff');
            const textDecoration = isLink ? 'underline' : 'none';
            const padding = isLink ? '2px 0' : `${bd.paddingY || 8}px ${bd.paddingX || 16}px`;
            const border = isLink ? 'none' : `1px solid ${bd.backgroundColor || '#3b82f6'}`;

            const iconHtml = bd.iconName ? `<span class="material-symbols-outlined" style="font-size: ${bd.fontSize || 14}px; vertical-align: middle; margin-right: ${bd.iconGap || 8}px; line-height: 1;">${bd.iconName}</span>` : '';

            content = `
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="${bd.textAlign || 'center'}" bgcolor="${bgColor}" style="border-radius: ${bd.borderRadius || 4}px;">
                    <a href="${bd.url || '#'}" target="_blank" style="font-family: ${fontStack}; font-size: ${bd.fontSize || 14}px; color: ${textColor}; text-decoration: ${textDecoration}; border-radius: ${bd.borderRadius || 4}px; padding: ${padding}; border: ${border}; display: inline-block; font-weight: bold; line-height: 1;">
                      ${iconHtml}${bd.text || 'Botão'}
                    </a>
                  </td>
                </tr>
              </table>
            `;
          } else if (item.type === 'emoji') {
            const ed = item.data;
            content = `<div style="font-size: ${ed.fontSize || 48}px; text-align: ${ed.textAlign || 'center'}; line-height: 1;">${ed.emoji || '😊'}</div>`;
          }
          
          return `
            <td valign="${d.alignItems === 'center' ? 'middle' : d.alignItems === 'end' ? 'bottom' : 'top'}" style="padding: 0 ${d.gap / 2}px;">
              ${content}
            </td>
          `;
        }).join('');

        return `
          <tr>
            <td style="padding: ${d.paddingTop ?? 0}px ${d.paddingRight ?? 20}px ${d.paddingBottom ?? 0}px ${d.paddingLeft ?? 20}px; ${getBlockStyle(block)}">
              <table border="0" cellspacing="0" cellpadding="0" align="${d.textAlign === 'center' ? 'center' : d.textAlign === 'right' ? 'right' : 'left'}">
                <tr>${cells}</tr>
              </table>
            </td>
          </tr>
        `;
      }
      case 'column-layout': {
        const d = block.data;
        const columns = d.columns || 2;
        const gap = d.gap ?? 16;
        const colWidths = d.widths || Array(columns).fill(100 / columns);
        
        const cells = d.items.map((item: any, i: number) => {
          let content = '';
          if (item.type === 'text') {
            const td = item.data;
            content = `<div style="font-family: ${fontStack}; font-size: ${td.fontSize || 14}px; color: ${td.color || '#334155'}; text-align: ${td.textAlign || 'left'}; font-weight: ${td.fontWeight || 'normal'}; font-style: ${td.fontStyle || 'normal'};">${td.content || ''}</div>`;
          } else if (item.type === 'image') {
            const id = item.data;
            const heightStyle = id.height ? `height: ${id.height}px; object-fit: cover;` : 'height: auto;';
            const imgHtml = id.url ? `<img src="${id.url}" alt="${id.alt}" width="${id.width || 100}%" style="display: block; width: ${id.width || 100}%; border-radius: ${id.borderRadius || 0}px; ${heightStyle}" />` : '';
            content = id.linkUrl ? `<a href="${id.linkUrl}" target="_blank" style="text-decoration: none;">${imgHtml}</a>` : imgHtml;
          } else if (item.type === 'icon') {
            const id = item.data;
            const sizeMap = { small: 24, medium: 48, large: 64 };
            const size = sizeMap[id.size as keyof typeof sizeMap] || 24;
            const padding = id.isCircular ? size / 2 : 0;
            content = `
              <div style="display: inline-block; background-color: ${id.backgroundColor || '#ffffff'}; border-radius: ${id.isCircular ? '50%' : '8px'}; padding: ${id.isCircular ? padding / 2 : 8}px; width: ${size}px; height: ${size}px; line-height: ${size}px; text-align: center;">
                <span class="material-symbols-outlined" style="color: ${id.color || '#3b82f6'}; font-size: ${size}px; line-height: ${size}px; display: block;">${id.iconName || 'star'}</span>
              </div>
            `;
          } else if (item.type === 'button') {
            const bd = item.data;
            const isLink = bd.variant === 'link';
            const bgColor = isLink ? 'transparent' : (bd.backgroundColor || '#3b82f6');
            const textColor = isLink ? '#3b82f6' : (bd.color || '#ffffff');
            const textDecoration = isLink ? 'underline' : 'none';
            const padding = isLink ? '2px 0' : `${bd.paddingY || 8}px ${bd.paddingX || 16}px`;
            const border = isLink ? 'none' : `1px solid ${bd.backgroundColor || '#3b82f6'}`;

            content = `
              <table border="0" cellspacing="0" cellpadding="0" width="100%">
                <tr>
                  <td align="${bd.textAlign || 'center'}">
                    <table border="0" cellspacing="0" cellpadding="0" width="${bd.fullWidth ? '100%' : 'auto'}">
                      <tr>
                        <td align="center" bgcolor="${bgColor}" style="border-radius: ${bd.borderRadius || 4}px;">
                          <a href="${bd.url || '#'}" target="_blank" style="font-family: ${fontStack}; font-size: ${bd.fontSize || 14}px; color: ${textColor}; text-decoration: ${textDecoration}; border-radius: ${bd.borderRadius || 4}px; padding: ${padding}; border: ${border}; display: ${bd.fullWidth ? 'block' : 'inline-block'}; font-weight: bold;">
                            ${bd.text || 'Botão'}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            `;
          } else if (item.type === 'emoji') {
            const ed = item.data;
            content = `<div style="font-size: ${ed.fontSize || 48}px; text-align: ${ed.textAlign || 'center'}; line-height: 1;">${ed.emoji || '😊'}</div>`;
          }
          
          const colInnerStyle = `background-color: ${item.backgroundColor || 'transparent'}; border: ${item.borderWidth || 0}px solid ${item.borderColor || 'transparent'}; border-radius: ${item.borderRadius || 0}px;`;
          
          let cellHtml = `
            <td width="${colWidths[i]}%" align="center" valign="${item.data.verticalAlign === 'center' ? 'middle' : (item.data.verticalAlign || 'top')}" style="padding: 10px; ${colInnerStyle}">
              ${content}
            </td>
          `;

          if (i < columns - 1 && gap > 0) {
            cellHtml += `<td width="${gap}" style="width: ${gap}px; line-height: 1px; font-size: 1px;">&nbsp;</td>`;
          }

          return cellHtml;
        }).join('');
        
        return `
          <tr>
            <td style="padding: ${d.paddingTop ?? 0}px ${d.paddingRight ?? 10}px ${d.paddingBottom ?? 0}px ${d.paddingLeft ?? 10}px; ${getBlockStyle(block)}">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>${cells}</tr>
              </table>
            </td>
          </tr>
        `;
      }
      default:
        return '';
    }
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Newsletter</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
  <style>
    body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${settings.backgroundColor};">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="${settings.backgroundColor}">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table width="600" border="0" cellspacing="0" cellpadding="0" bgcolor="${settings.contentBackgroundColor}" style="width: 600px; max-width: 600px;">
          ${blocks.map(renderBlock).join('')}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};
