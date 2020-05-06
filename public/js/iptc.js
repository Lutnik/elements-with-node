function decodePolish(code) {
  switch (code) {
    case 0xc484:
      return "Ą";
    case 0xc486:
      return "Ć";
    case 0xc498:
      return "Ę";
    case 0xc581:
      return "Ł";
    case 0xc583:
      return "Ń";
    case 0xc393:
      return "Ó";
    case 0xc59a:
      return "Ś";
    case 0xc5b9:
      return "Ź";
    case 0xc5bb:
      return "Ż";
    case 0xc485:
      return "ą";
    case 0xc487:
      return "ć";
    case 0xc499:
      return "ę";
    case 0xc582:
      return "ł";
    case 0xc584:
      return "ń";
    case 0xc3b3:
      return "ó";
    case 0xc59b:
      return "ś";
    case 0xc5ba:
      return "ź";
    case 0xc5bc:
      return "ż";
    default:
      return (
        String.fromCharCode(code >> 8) + String.fromCharCode(code & 0x00ff)
      );
  }
}

function translateTagNames(tag) {
  // Tag IDs from https://exiftool.org/TagNames/IPTC.html
  switch (tag) {
    case 5:
      return "document_title";
    case 10:
      return "urgency";
    case 12:
      return "subject";
    case 15:
      return "category";
    case 20:
      return "supplemental_categories";
    case 25:
      return "keywords";
    case 26:
      return "content_location_code";
    case 27:
      return "content_location_name";
    case 30:
      return "release_date";
    case 35:
      return "release_time";
    case 37:
      return "expiration_time";
    case 38:
      return "expiration_date";
    case 40:
      return "special_instructions";
    case 55:
      return "date_created";
    case 60:
      return "time_created";
    case 65:
      return "originating_program";
    case 80:
      return "author_byline";
    case 85:
      return "title_byline";
    case 90:
      return "city";
    case 92:
      return "sublocation";
    case 95:
      return "province_state";
    case 100:
      return "country_code";
    case 101:
      return "country";
    case 103:
      return "original_transmission_reference";
    case 105:
      return "headline";
    case 110:
      return "credits";
    case 115:
      return "source";
    case 116:
      return "copyright_notice";
    case 118:
      return "contact";
    case 120:
      return "caption";
    case 122:
      return "caption_writer";
    case 130:
      return "image_type";
    case 131:
      return "image_orientation";
    case 135:
      return "language_identifier";
    default:
      return tag;
  }
}

function getTags(file, cb) {
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  reader.onload = function(e) {
    const view = new DataView(e.target.result);
    const length = view.byteLength;
    let offset = 0;

    if (view.getUint16(offset, false) != 0xffd8)
      return cb({ status: 0, tags: { error: "Not a jpeg" } });
    offset += 2;
    if (view.getUint16(offset, false) != 0xffed)
      return cb({ status: 0, tags: { error: "No IPCT data in file header" } });
    offset += 2;
    let buffer = 0x00;
    let data = {};

    while (offset < length) {
      read = view.getUint8(offset++, false);
      buffer = buffer & 0x00ff;
      buffer = buffer << 8;
      buffer = buffer | read;
      if (buffer === 0x1c02) {
        let tagName = view.getUint8(offset++, false);
        tagName = translateTagNames(tagName);
        offset++;
        let tagLength = view.getUint8(offset++, false);

        const dataOffset = offset + tagLength;
        let tagContent = "";

        while (offset < dataOffset) {
          read = view.getUint8(offset++, false);
          if (read >= 0xc3) {
            let unicode = read;
            read = view.getUint8(offset++, false);
            unicode = unicode << 8;
            unicode = unicode | read;
            tagContent += decodePolish(unicode);
          } else {
            tagContent += String.fromCharCode(read);
          }
        }
        data[tagName] = tagContent;
      } else if (buffer === 0xffe1) {
        if (view.getUint32(offset + 2, false) === 0x45786966) break;
      }
    }
    return Object.keys(data).length > 0
      ? cb({ status: 1, tags: data })
      : cb({ status: 0, tags: { error: "No data found" } });
  };
}
