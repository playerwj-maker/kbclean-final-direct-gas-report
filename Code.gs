/**
 * KB클린 현장관리 앱 → Google Sheet / Drive / Slides / PDF 자동 보고서 생성
 * v4-final-direct-gas
 *
 * 핵심 수정
 * 1) 사진 저장 후 음성에서 오류가 나도 시트/보고서 단계가 중단되지 않도록 분리
 * 2) data:audio/webm;codecs=opus;base64 형식 처리
 * 3) 시트 행을 먼저 만들고, 단계별 URL/오류를 마지막에 업데이트
 * 4) URL을 브라우저에서 열면 현재 배포 버전을 확인할 수 있음
 */

const APP_NAME = 'KB클린 현장보고';
const APP_VERSION = 'v4-final-direct-gas-20260528';
const SHEET_NAME = '작업기록';
const HEADERS = [
  '기록ID', '상태', '전송일시', '현장명', '직원', '담당자', '출근시간', '퇴근시간',
  '체크완료', '필수사진', '특이사항', '정기사진URL', '필수사진URL', '음성메모URL',
  '슬라이드URL', 'PDF URL', '폴더URL', '오류메시지', '앱버전'
];

function initialSetup() {
  const props = PropertiesService.getScriptProperties();
  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');

  let rootFolder = null;
  const savedFolderId = props.getProperty('OUTPUT_FOLDER_ID');
  if (savedFolderId) {
    try { rootFolder = DriveApp.getFolderById(savedFolderId); } catch (e) { rootFolder = null; }
  }
  if (!rootFolder) {
    rootFolder = DriveApp.createFolder(`${APP_NAME}_자동생성_${now}`);
    props.setProperty('OUTPUT_FOLDER_ID', rootFolder.getId());
  }

  let ss = null;
  const savedSpreadsheetId = props.getProperty('SPREADSHEET_ID');
  if (savedSpreadsheetId) {
    try { ss = SpreadsheetApp.openById(savedSpreadsheetId); } catch (e) { ss = null; }
  }
  if (!ss) {
    ss = SpreadsheetApp.create(`${APP_NAME}_데이터`);
    props.setProperty('SPREADSHEET_ID', ss.getId());
    try { DriveApp.getFileById(ss.getId()).moveTo(rootFolder); } catch (e) {}
  }
  ensureSheetHeaders_(ss);

  let templateId = props.getProperty('TEMPLATE_SLIDES_ID');
  let templateOk = false;
  if (templateId) {
    try { DriveApp.getFileById(templateId); templateOk = true; } catch (e) { templateOk = false; }
  }
  if (!templateOk) {
    const pres = SlidesApp.create(`${APP_NAME}_슬라이드_템플릿`);
    templateId = pres.getId();
    buildTemplate_(pres);
    pres.saveAndClose();
    props.setProperty('TEMPLATE_SLIDES_ID', templateId);
    try { DriveApp.getFileById(templateId).moveTo(rootFolder); } catch (e) {}
  }

  Logger.log('초기 설정 완료');
  Logger.log('VERSION: ' + APP_VERSION);
  Logger.log('ROOT_FOLDER_URL: ' + rootFolder.getUrl());
  Logger.log('SPREADSHEET_URL: ' + ss.getUrl());
  Logger.log('TEMPLATE_ID: ' + templateId);
}

function doGet() {
  const props = PropertiesService.getScriptProperties();
  return jsonOutput({
    ok: true,
    app: APP_NAME,
    version: APP_VERSION,
    hasOutputFolder: !!props.getProperty('OUTPUT_FOLDER_ID'),
    hasSpreadsheet: !!props.getProperty('SPREADSHEET_ID'),
    hasTemplate: !!props.getProperty('TEMPLATE_SLIDES_ID'),
    message: 'KB클린 Apps Script Web App is running.'
  });
}

function doPost(e) {
  try {
    ensureSetup_();
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const payload = JSON.parse(raw);
    const result = createReport_(payload);
    return jsonOutput(result);
  } catch (error) {
    Logger.log('FATAL doPost ERROR: ' + error.message + '\n' + (error.stack || ''));
    try { appendFatalRow_(error); } catch (ignored) {}
    return jsonOutput({
      ok: false,
      version: APP_VERSION,
      message: error.message,
      stack: String(error.stack || '')
    });
  }
}

function createReport_(payload) {
  const props = PropertiesService.getScriptProperties();
  const rootFolder = DriveApp.getFolderById(props.getProperty('OUTPUT_FOLDER_ID'));
  const ss = SpreadsheetApp.openById(props.getProperty('SPREADSHEET_ID'));
  const sheet = ensureSheetHeaders_(ss);
  const templateId = props.getProperty('TEMPLATE_SLIDES_ID');

  const tz = Session.getScriptTimeZone();
  const now = new Date();
  const ymd = Utilities.formatDate(now, tz, 'yyyy-MM-dd');
  const stamp = Utilities.formatDate(now, tz, 'yyyyMMdd_HHmmss');
  const recordId = `KB-${stamp}`;

  const site = payload.site || {};
  const siteName = site.name || payload.siteName || '현장';
  const staff = payload.staff || site.staff || '';
  const manager = payload.manager || site.manager || '';
  const checklist = Array.isArray(payload.checklist) ? payload.checklist : [];
  const requiredPhotos = Array.isArray(payload.requiredPhotos) ? payload.requiredPhotos : [];
  const specialOrders = Array.isArray(payload.specialOrders) ? payload.specialOrders : [];
  const notes = payload.notes || {};

  const dayFolder = getOrCreateFolder_(rootFolder, ymd);
  const recordFolder = getOrCreateFolder_(dayFolder, `${recordId}_${safeFileName_(siteName)}`);
  const photoFolder = getOrCreateFolder_(recordFolder, '01_사진');
  const voiceFolder = getOrCreateFolder_(recordFolder, '02_음성');
  const reportFolder = getOrCreateFolder_(recordFolder, '03_보고서');

  const doneChecklistCount = checklist.filter(x => x && x.done).length;
  const requiredPhotoCount = requiredPhotos.filter(x => x && (x.taken || x.photoDataUrl)).length;
  const noteText = makeNoteText_(notes);

  // 시트 행을 제일 먼저 생성합니다. 이후 어느 단계에서 실패해도 기록은 남습니다.
  const rowNumber = sheet.getLastRow() + 1;
  sheet.getRange(rowNumber, 1, 1, HEADERS.length).setValues([makeRow_({
    recordId,
    status: '접수',
    now,
    tz,
    siteName,
    staff,
    manager,
    clockInAt: payload.clockInAt || '',
    clockOutAt: payload.clockOutAt || '',
    doneChecklist: `${doneChecklistCount}/${checklist.length}`,
    requiredPhotos: `${requiredPhotoCount}/${requiredPhotos.length}`,
    noteText,
    checklistPhotoUrls: '',
    requiredPhotoUrls: '',
    voiceUrl: '',
    slideUrl: '',
    pdfUrl: '',
    folderUrl: recordFolder.getUrl(),
    errorMessage: '',
  })]);

  const errors = [];
  const savedChecklistPhotos = [];
  const savedRequiredPhotos = [];
  let voiceUrl = '';
  let slideUrl = '';
  let pdfUrl = '';

  // 1) 정기점검 사진 저장
  checklist.forEach((item, idx) => {
    if (!item || !item.photoDataUrl) return;
    try {
      const file = saveDataUrl_(photoFolder, item.photoDataUrl, safeFileName_(`체크_${item.label || item.id || idx}.jpg`));
      savedChecklistPhotos.push({ label: item.label || item.id || `체크${idx + 1}`, url: file.getUrl(), id: file.getId() });
    } catch (e) {
      errors.push(`정기사진 저장 실패(${item.label || item.id || idx}): ${e.message}`);
    }
  });

  // 2) 필수증빙 사진 저장
  requiredPhotos.forEach((item, idx) => {
    if (!item || !item.photoDataUrl) return;
    try {
      const file = saveDataUrl_(photoFolder, item.photoDataUrl, safeFileName_(`필수_${item.label || item.id || idx}.jpg`));
      savedRequiredPhotos.push({ label: item.label || item.id || `필수${idx + 1}`, url: file.getUrl(), id: file.getId() });
    } catch (e) {
      errors.push(`필수사진 저장 실패(${item.label || item.id || idx}): ${e.message}`);
    }
  });

  // 3) 음성 저장. audio/webm;codecs=opus;base64 형식 지원
  if (notes.voiceDataUrl) {
    try {
      const ext = guessExtensionFromDataUrl_(notes.voiceDataUrl, 'webm');
      const voiceFile = saveDataUrl_(voiceFolder, notes.voiceDataUrl, safeFileName_(`음성메모_${recordId}.${ext}`));
      voiceUrl = voiceFile.getUrl();
    } catch (e) {
      errors.push(`음성 저장 실패: ${e.message}`);
    }
  }

  // 4) 구글 슬라이드 생성
  try {
    const copy = DriveApp.getFileById(templateId).makeCopy(`${recordId}_${safeFileName_(siteName)}_일일보고서`, reportFolder);
    const pres = SlidesApp.openById(copy.getId());
    fillPresentation_(pres, {
      ymd,
      siteName,
      staff,
      manager,
      clockInAt: payload.clockInAt || '-',
      clockOutAt: payload.clockOutAt || '-',
      doneChecklistCount,
      checklistTotal: checklist.length,
      requiredPhotoCount,
      requiredPhotoTotal: requiredPhotos.length,
      specialOrders,
      savedChecklistPhotos,
      savedRequiredPhotos,
      voiceUrl,
      voiceDuration: notes.voiceDuration,
      noteText,
    });
    pres.saveAndClose();
    slideUrl = copy.getUrl();

    try {
      Utilities.sleep(1200);
      const pdfBlob = DriveApp.getFileById(copy.getId()).getBlob().getAs(MimeType.PDF).setName(`${recordId}_${safeFileName_(siteName)}_일일보고서.pdf`);
      const pdfFile = reportFolder.createFile(pdfBlob);
      pdfUrl = pdfFile.getUrl();
    } catch (pdfError) {
      errors.push(`PDF 생성 실패: ${pdfError.message}`);
    }
  } catch (e) {
    errors.push(`슬라이드 생성 실패: ${e.message}`);
  }

  const status = errors.length ? '부분완료' : '완료';
  const errorMessage = errors.join('\n');

  // 5) 최종 업데이트
  sheet.getRange(rowNumber, 1, 1, HEADERS.length).setValues([makeRow_({
    recordId,
    status,
    now,
    tz,
    siteName,
    staff,
    manager,
    clockInAt: payload.clockInAt || '',
    clockOutAt: payload.clockOutAt || '',
    doneChecklist: `${doneChecklistCount}/${checklist.length}`,
    requiredPhotos: `${requiredPhotoCount}/${requiredPhotos.length}`,
    noteText: makeNoteText_(notes, voiceUrl),
    checklistPhotoUrls: savedChecklistPhotos.map(x => x.url).join('\n'),
    requiredPhotoUrls: savedRequiredPhotos.map(x => x.url).join('\n'),
    voiceUrl,
    slideUrl,
    pdfUrl,
    folderUrl: recordFolder.getUrl(),
    errorMessage,
  })]);

  return {
    ok: true,
    version: APP_VERSION,
    recordId,
    status,
    sheetUrl: ss.getUrl(),
    folderUrl: recordFolder.getUrl(),
    photoFolderUrl: photoFolder.getUrl(),
    voiceUrl,
    slideUrl,
    pdfUrl,
    message: errorMessage,
  };
}

function makeRow_(data) {
  return [
    data.recordId || '',
    data.status || '',
    Utilities.formatDate(data.now || new Date(), data.tz || Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'),
    data.siteName || '',
    data.staff || '',
    data.manager || '',
    data.clockInAt || '',
    data.clockOutAt || '',
    data.doneChecklist || '',
    data.requiredPhotos || '',
    data.noteText || '',
    data.checklistPhotoUrls || '',
    data.requiredPhotoUrls || '',
    data.voiceUrl || '',
    data.slideUrl || '',
    data.pdfUrl || '',
    data.folderUrl || '',
    data.errorMessage || '',
    APP_VERSION,
  ];
}

function fillPresentation_(pres, data) {
  const orderText = (data.specialOrders || []).map(o => `${o.done ? '완료' : '미완료'} - ${o.text}`).join('\n');
  pres.replaceAllText('{{SITE_NAME}}', data.siteName || '-');
  pres.replaceAllText('{{REPORT_DATE}}', data.ymd || '-');
  pres.replaceAllText('{{CLOCK_IN}}', data.clockInAt || '-');
  pres.replaceAllText('{{CLOCK_OUT}}', data.clockOutAt || '-');
  pres.replaceAllText('{{STAFF}}', data.staff || '-');
  pres.replaceAllText('{{SUMMARY}}', [
    `현장: ${data.siteName || '-'}`,
    `담당자: ${data.manager || '-'}`,
    `체크리스트 완료: ${data.doneChecklistCount} / ${data.checklistTotal}`,
    `필수 증빙 사진: ${data.requiredPhotoCount} / ${data.requiredPhotoTotal}`,
    `특별 작업지시:\n${orderText || '-'}`,
    `정기점검 사진 저장: ${(data.savedChecklistPhotos || []).length}장`,
    `필수증빙 사진 저장: ${(data.savedRequiredPhotos || []).length}장`,
    `음성 메모: ${data.voiceUrl ? '첨부됨' : '-'}`,
  ].join('\n'));
  pres.replaceAllText('{{NOTES}}', data.noteText || '-');

  appendPhotoSlides_(pres, '정기 점검 사진', data.savedChecklistPhotos || []);
  appendPhotoSlides_(pres, '필수 증빙 사진', data.savedRequiredPhotos || []);
  if (data.voiceUrl) appendVoiceSlide_(pres, data.voiceUrl, data.voiceDuration);
}

function appendPhotoSlides_(pres, title, photos) {
  if (!photos || photos.length === 0) return;
  const perSlide = 4;
  for (let i = 0; i < photos.length; i += perSlide) {
    const batch = photos.slice(i, i + perSlide);
    const slide = pres.appendSlide(SlidesApp.PredefinedLayout.BLANK);
    slide.getBackground().setSolidFill('#F6F4EE');
    slide.insertTextBox(title, 35, 25, 650, 36)
      .getText().getTextStyle().setFontSize(23).setBold(true).setForegroundColor('#1E2761');

    batch.forEach((photo, idx) => {
      const x = idx % 2 === 0 ? 40 : 365;
      const y = idx < 2 ? 85 : 285;
      const w = 280;
      const h = 160;
      try {
        const blob = DriveApp.getFileById(photo.id).getBlob();
        const img = slide.insertImage(blob);
        img.setLeft(x).setTop(y).setWidth(w);
        if (img.getHeight() > h) img.setHeight(h);
      } catch (e) {
        slide.insertTextBox(`이미지 삽입 실패\n${photo.url || ''}`, x, y, w, h)
          .getText().getTextStyle().setFontSize(10).setForegroundColor('#C2410C');
      }
      slide.insertTextBox(photo.label || '', x, y + h + 8, w, 30)
        .getText().getTextStyle().setFontSize(11).setForegroundColor('#4B5274');
    });
  }
}

function appendVoiceSlide_(pres, voiceUrl, duration) {
  const slide = pres.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  slide.getBackground().setSolidFill('#F6F4EE');
  slide.insertTextBox('음성 메모', 40, 35, 620, 40)
    .getText().getTextStyle().setFontSize(24).setBold(true).setForegroundColor('#1E2761');
  slide.insertTextBox(`음성 파일 URL:\n${voiceUrl}\n\n녹음 길이: ${duration ? duration + '초' : '-'}`, 40, 110, 620, 180)
    .getText().getTextStyle().setFontSize(14).setForegroundColor('#1A1F3A');
}

function makeNoteText_(notes, voiceUrl) {
  const parts = [];
  if (notes && notes.noteMode === 'none') parts.push('특이사항 없음');
  if (notes && notes.chips && notes.chips.length) parts.push(notes.chips.join(', '));
  if (notes && notes.text) parts.push(notes.text);
  if ((voiceUrl || (notes && notes.voiceDataUrl))) parts.push(`음성 메모 첨부${notes.voiceDuration ? ' (' + notes.voiceDuration + '초)' : ''}`);
  return parts.join('\n');
}

function saveDataUrl_(folder, dataUrl, filename) {
  const parsed = parseDataUrl_(dataUrl);
  const bytes = Utilities.base64Decode(parsed.base64);
  const blob = Utilities.newBlob(bytes, parsed.mimeType, filename);
  return folder.createFile(blob);
}

function parseDataUrl_(dataUrl) {
  const str = String(dataUrl || '');
  const comma = str.indexOf(',');
  if (!str.startsWith('data:') || comma === -1) {
    throw new Error('잘못된 파일 데이터 형식입니다. data URL이 아닙니다.');
  }
  const header = str.substring(5, comma); // 예: audio/webm;codecs=opus;base64
  const base64 = str.substring(comma + 1).replace(/\s/g, '');
  if (header.toLowerCase().indexOf('base64') === -1) {
    throw new Error('base64 파일 데이터가 아닙니다. header=' + header);
  }
  const mimeType = header.split(';')[0] || 'application/octet-stream';
  if (!base64) throw new Error('base64 본문이 비어 있습니다.');
  return { mimeType, base64 };
}

function guessExtensionFromDataUrl_(dataUrl, fallback) {
  try {
    const mime = parseDataUrl_(dataUrl).mimeType.toLowerCase();
    if (mime.indexOf('webm') !== -1) return 'webm';
    if (mime.indexOf('mp4') !== -1) return 'm4a';
    if (mime.indexOf('mpeg') !== -1) return 'mp3';
    if (mime.indexOf('wav') !== -1) return 'wav';
    if (mime.indexOf('jpeg') !== -1) return 'jpg';
    if (mime.indexOf('png') !== -1) return 'png';
  } catch (e) {}
  return fallback || 'bin';
}

function ensureSetup_() {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('OUTPUT_FOLDER_ID') || !props.getProperty('SPREADSHEET_ID') || !props.getProperty('TEMPLATE_SLIDES_ID')) {
    initialSetup();
  }
}

function ensureSheetHeaders_(ss) {
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.getSheets()[0] || ss.insertSheet(SHEET_NAME);
  sheet.setName(SHEET_NAME);
  const firstRow = sheet.getRange(1, 1, 1, Math.max(HEADERS.length, sheet.getLastColumn() || 1)).getValues()[0];
  const hasRecordHeader = firstRow && firstRow[0] === HEADERS[0];
  if (!hasRecordHeader) {
    sheet.clear();
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  } else if (sheet.getLastColumn() < HEADERS.length) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
  return sheet;
}

function buildTemplate_(pres) {
  const slide = pres.getSlides()[0];
  slide.getBackground().setSolidFill('#F6F4EE');
  slide.insertTextBox('KB클린 일일 현장보고서', 40, 35, 620, 50)
    .getText().getTextStyle().setFontSize(28).setBold(true).setForegroundColor('#1E2761');
  slide.insertTextBox('{{SITE_NAME}} · {{REPORT_DATE}}', 42, 92, 620, 30)
    .getText().getTextStyle().setFontSize(14).setForegroundColor('#4B5274');
  slide.insertTextBox('출근 {{CLOCK_IN}}   |   퇴근 {{CLOCK_OUT}}   |   직원 {{STAFF}}', 42, 135, 620, 28)
    .getText().getTextStyle().setFontSize(14).setForegroundColor('#1A1F3A');
  slide.insertTextBox('{{SUMMARY}}', 42, 190, 620, 180)
    .getText().getTextStyle().setFontSize(14).setForegroundColor('#1A1F3A');
  slide.insertTextBox('특이사항: {{NOTES}}', 42, 390, 620, 80)
    .getText().getTextStyle().setFontSize(13).setForegroundColor('#4B5274');
}

function getOrCreateFolder_(parent, name) {
  const iter = parent.getFoldersByName(name);
  return iter.hasNext() ? iter.next() : parent.createFolder(name);
}

function safeFileName_(name) {
  return String(name || '').replace(/[\\/:*?"<>|]/g, '_').slice(0, 120);
}

function appendFatalRow_(error) {
  const props = PropertiesService.getScriptProperties();
  const spreadsheetId = props.getProperty('SPREADSHEET_ID');
  if (!spreadsheetId) return;
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheet = ensureSheetHeaders_(ss);
  const now = new Date();
  const tz = Session.getScriptTimeZone();
  const recordId = `FATAL-${Utilities.formatDate(now, tz, 'yyyyMMdd_HHmmss')}`;
  sheet.appendRow(makeRow_({
    recordId,
    status: '실패',
    now,
    tz,
    errorMessage: error.message + '\n' + String(error.stack || '')
  }));
}

function testManualNoFile() {
  // Apps Script 화면에서 이 함수를 실행하면 사진 없이 시트/슬라이드/PDF 생성이 되는지 확인할 수 있습니다.
  ensureSetup_();
  const result = createReport_({
    site: { name: '리투의원', staff: '박지용', manager: '박원준' },
    staff: '박지용',
    manager: '박원준',
    clockInAt: '09:00',
    clockOutAt: '12:00',
    checklist: [{ id: 'p1', label: '6층 관리실 거울', done: true, photoDataUrl: '' }],
    requiredPhotos: [{ id: 'rp1', label: '출입문 유리', taken: true, photoDataUrl: '' }],
    specialOrders: [{ id: 'o1', text: 'VIP 사전점검', done: true }],
    notes: { noteMode: 'none', chips: [], text: '', voiceDataUrl: '', voiceDuration: 0 }
  });
  Logger.log(JSON.stringify(result, null, 2));
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
