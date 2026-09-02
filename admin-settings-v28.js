const SOCIAL_DEFAULTS = [
  {id:"phone-main",type:"phone",label_ru:"Обычный звонок",label_hy:"Սովորական զանգ",label_en:"Phone call",display_value:"099 611 966",url:"tel:+37499611966"},
  {id:"whatsapp-main",type:"whatsapp",label_ru:"WhatsApp",label_hy:"WhatsApp",label_en:"WhatsApp",display_value:"099 611 966",url:"https://wa.me/37499611966"},
  {id:"telegram-main",type:"telegram",label_ru:"Telegram",label_hy:"Telegram",label_en:"Telegram",display_value:"@tattooizabella",url:"https://t.me/tattooizabella"},
  {id:"instagram-studio",type:"instagram",label_ru:"Instagram Studio",label_hy:"Instagram սրահ",label_en:"Instagram Studio",display_value:"@tattooizabellastudio",url:"https://www.instagram.com/tattooizabellastudio"},
  {id:"instagram-master",type:"instagram",label_ru:"Instagram Izabella",label_hy:"Instagram Izabella",label_en:"Instagram Izabella",display_value:"@tattooizabella",url:"https://www.instagram.com/tattooizabella"},
  {id:"facebook-main",type:"facebook",label_ru:"Facebook",label_hy:"Facebook",label_en:"Facebook",display_value:"tattooizabella",url:"https://www.facebook.com/tattooizabella/"},
  {id:"tiktok-main",type:"tiktok",label_ru:"TikTok",label_hy:"TikTok",label_en:"TikTok",display_value:"@tattooizabella",url:"https://www.tiktok.com/@tattooizabella"},
  {id:"youtube-main",type:"youtube",label_ru:"YouTube",label_hy:"YouTube",label_en:"YouTube",display_value:"@tattooizabella",url:"https://www.youtube.com/@tattooizabella"}
];

const ARTIST_DEFAULTS = {
  artist_name_ru:"Тигран Хачатрян",
  artist_name_hy:"Տիգրան Խաչատրյան",
  artist_name_en:"Tigran Khachatryan",
  artist_about_ru:"Тату-мастер TATTOOIZABELLA в Ереване. Специализация — Black & Grey, реализм и глубокие сюжетные композиции. Каждая работа создаётся индивидуально.",
  artist_about_hy:"TATTOOIZABELLA-ի դաջվածքի վարպետը Երևանում։ Black & Grey, ռեալիզմ և անհատական աշխատանքներ։",
  artist_about_en:"The artist behind TATTOOIZABELLA in Yerevan, specializing in Black & Grey, realism and custom compositions.",
  artist_works_count:"1450+",
  artist_followers_count:"64.9K",
  artist_approach_count:"100%"
};

const TRAINING_DEFAULTS = {
  training_enabled:"true",
  training_master_id:"primary",
  training_title_ru:"Индивидуальное обучение татуировке",
  training_title_hy:"Անհատական դաջվածքի ուսուցում",
  training_title_en:"Private tattoo training",
  training_text_ru:"Практическое обучение с мастером — от основ и оборудования до уверенной самостоятельной работы.",
  training_text_hy:"Գործնական ուսուցում վարպետի հետ՝ հիմունքներից և սարքավորումից մինչև վստահ ինքնուրույն աշխատանք։",
  training_text_en:"Hands-on training with the artist — from fundamentals and equipment to confident independent work.",
  training_program_ru:"Безопасность и стерильность\nОборудование и настройка машинки\nПостроение эскиза и перенос\nПрактика техники под контролем мастера",
  training_program_hy:"Անվտանգություն և ստերիլություն\nՍարքավորում և մեքենայի կարգավորում\nԷսքիզի կառուցում և փոխանցում\nՏեխնիկայի գործնական աշխատանք վարպետի հսկողությամբ",
  training_program_en:"Safety and sterilization\nEquipment and machine setup\nDesign and stencil transfer\nSupervised technique practice",
  training_format_ru:"Индивидуально · Ереван",
  training_format_hy:"Անհատական · Երևան",
  training_format_en:"Private · Yerevan",
  training_duration_ru:"По программе",
  training_duration_hy:"Ըստ ծրագրի",
  training_duration_en:"Program-based",
  training_price_from:"0",
  training_details_ru:"",
  training_details_hy:"",
  training_details_en:"",
  training_file_label_ru:"Скачать программу курса",
  training_file_label_hy:"Ներբեռնել դասընթացի ծրագիրը",
  training_file_label_en:"Download course program",
  training_file_url:"",
  training_file_name:"",
  training_file_path:""
};

let artistCertificates = [];
let socialLinks = [];

function parseSettingList(value, fallback = []) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

async function refreshExtraSettings() {
  const {data = [], error} = await sb.from("site_settings").select("*");
  if (error) {
    toast("Не удалось загрузить дополнительные настройки");
    return;
  }
  settings = Object.fromEntries(data.map(row => [row.key, row.value]));
  artistCertificates = parseSettingList(settings.artist_certificates, []);
  socialLinks = settings.social_links === undefined ? SOCIAL_DEFAULTS.map(item => ({...item})) : parseSettingList(settings.social_links, []);
  hydrateArtistForm();
  hydrateTrainingForm();
  renderCertificates();
  renderSocials();
}

function hydrateTrainingForm() {
  const form = $("#trainingForm");
  if (!form) return;
  for (const [key, fallback] of Object.entries(TRAINING_DEFAULTS)) form.elements[key].value = settings[key] ?? fallback;
  renderTrainingFile();
}

function renderTrainingFile() {
  const box = $("#trainingFileCurrent"), link = $("#trainingFileLink");
  if (!box || !link) return;
  const url = settings.training_file_url || "";
  box.hidden = !url;
  link.href = url || "#";
  link.textContent = url ? `Открыть: ${settings.training_file_name || "материал курса"} ↗` : "";
}

$("#trainingForm").onsubmit = async event => {
  event.preventDefault();
  const form = event.target;
  const button = form.querySelector('[type="submit"]');
  const values = {};
  for (const key of Object.keys(TRAINING_DEFAULTS)) values[key] = form.elements[key].value.trim();
  button.disabled = true;
  const status = $("#trainingFileStatus"), file = form.elements.training_file_upload.files[0];
  let uploadedPath = "";
  const previousPath = settings.training_file_path || "";
  try {
    if (file) {
      const allowed = /\.(pdf|jpe?g|png|webp|docx?|txt)$/i.test(file.name);
      if (!allowed) throw new Error("Поддерживаются PDF, изображения, Word и TXT");
      if (file.size > 20 * 1024 * 1024) throw new Error("Файл больше 20 МБ");
      status.className = "upload-status working";
      status.textContent = `Загрузка: ${file.name}`;
      uploadedPath = `training/${Date.now()}-${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
      const uploaded = await sb.storage.from("portfolio").upload(uploadedPath, file, {cacheControl:"3600", contentType:file.type || undefined, upsert:false});
      if (uploaded.error) throw uploaded.error;
      values.training_file_url = sb.storage.from("portfolio").getPublicUrl(uploadedPath).data.publicUrl;
      values.training_file_name = file.name;
      values.training_file_path = uploadedPath;
    }
    await saveSettingsValues(values);
    if (uploadedPath && previousPath && previousPath !== uploadedPath) await sb.storage.from("portfolio").remove([previousPath]);
    form.elements.training_file_upload.value = "";
    status.className = "upload-status success";
    status.textContent = file ? "Файл загружен и опубликован" : "";
    renderTrainingFile();
    toast("Раздел обучения обновлён");
  } catch (error) {
    console.error(error);
    if (uploadedPath) await sb.storage.from("portfolio").remove([uploadedPath]);
    status.className = "upload-status error";
    status.textContent = error.message || "Не удалось загрузить файл";
    toast("Не удалось сохранить обучение");
  } finally {
    button.disabled = false;
  }
};

$("#removeTrainingFile").onclick = async () => {
  const path = settings.training_file_path || "";
  if (!settings.training_file_url || !confirm("Удалить прикреплённый материал обучения?")) return;
  try {
    await saveSettingsValues({training_file_url:"", training_file_name:"", training_file_path:""});
    if (path) await sb.storage.from("portfolio").remove([path]);
    const form = $("#trainingForm");
    form.elements.training_file_url.value = "";
    form.elements.training_file_name.value = "";
    form.elements.training_file_path.value = "";
    renderTrainingFile();
    toast("Файл обучения удалён");
  } catch (error) {
    console.error(error);
    toast("Не удалось удалить файл");
  }
};

async function saveSettingsValues(values) {
  const rows = Object.entries(values).map(([key, value]) => ({key, value:String(value ?? "")}));
  const {error} = await sb.from("site_settings").upsert(rows, {onConflict:"key"});
  if (error) throw error;
  Object.assign(settings, values);
}

function hydrateArtistForm() {
  const form = $("#artistForm");
  if (!form) return;
  for (const [key, fallback] of Object.entries(ARTIST_DEFAULTS)) {
    form.elements[key].value = settings[key] || (key === "artist_name_ru" ? settings.artist_name : "") || fallback;
  }
}

$("#artistForm").onsubmit = async event => {
  event.preventDefault();
  const form = event.target;
  const button = form.querySelector('[type="submit"]');
  button.disabled = true;
  const values = {};
  for (const key of Object.keys(ARTIST_DEFAULTS)) values[key] = form.elements[key].value.trim();
  values.artist_name = values.artist_name_ru;
  try {
    await saveSettingsValues(values);
    const legacyArtist = document.querySelector('[name="artist_name"]');
    if (legacyArtist) legacyArtist.value = values.artist_name_ru;
    toast("Профиль мастера обновлён");
  } catch (error) {
    console.error(error);
    toast("Не удалось сохранить профиль мастера");
  } finally {
    button.disabled = false;
  }
};

function certificateTitle(item) {
  return item.title_ru || item.title_hy || item.title_en || "Сертификат";
}

function renderCertificates() {
  const list = $("#certificatesList");
  const empty = $("#emptyCertificates");
  empty.style.display = artistCertificates.length ? "none" : "block";
  list.innerHTML = artistCertificates.map(item => `
    <article class="manager-card">
      <span class="manager-mark">${item.image_url ? `<img src="${esc(item.image_url)}" alt="">` : "✓"}</span>
      <div class="manager-copy"><b>${esc(certificateTitle(item))}</b><small>${esc(item.year || "Без даты")}</small></div>
      <div class="manager-actions"><button data-edit-certificate="${esc(item.id)}">Изменить</button><button class="danger" data-delete-certificate="${esc(item.id)}">Удалить</button></div>
    </article>`).join("");
  $$('[data-edit-certificate]').forEach(button => button.onclick = () => openCertificate(button.dataset.editCertificate));
  $$('[data-delete-certificate]').forEach(button => button.onclick = () => deleteCertificate(button.dataset.deleteCertificate));
}

function openCertificate(id = "") {
  const form = $("#certificateForm");
  form.reset();
  const item = artistCertificates.find(entry => entry.id === id) || {};
  for (const key of ["id", "title_ru", "title_hy", "title_en", "year"]) form.elements[key].value = item[key] || "";
  $("#certificateDialog").showModal();
}

$("#addCertificate").onclick = () => openCertificate();

$("#certificateForm").onsubmit = async event => {
  event.preventDefault();
  const form = event.target;
  const button = form.querySelector('[type="submit"]');
  const fields = form.elements;
  const existing = artistCertificates.find(entry => entry.id === fields.id.value) || {};
  let image_url = existing.image_url || "";
  let storage_path = existing.storage_path || "";
  let uploadedPath = "";
  button.disabled = true;
  try {
    const file = fields.image.files[0];
    if (file) {
      const nextPath = `certificates/${Date.now()}-${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
      const uploaded = await sb.storage.from("portfolio").upload(nextPath, file, {cacheControl:"3600", upsert:false});
      if (uploaded.error) throw uploaded.error;
      image_url = sb.storage.from("portfolio").getPublicUrl(nextPath).data.publicUrl;
      uploadedPath = nextPath;
      storage_path = nextPath;
    }
    const item = {
      id:existing.id || crypto.randomUUID(),
      title_ru:fields.title_ru.value.trim(),
      title_hy:fields.title_hy.value.trim() || fields.title_ru.value.trim(),
      title_en:fields.title_en.value.trim() || fields.title_ru.value.trim(),
      year:fields.year.value.trim(),
      image_url,
      storage_path
    };
    const nextCertificates = existing.id ? artistCertificates.map(entry => entry.id === existing.id ? item : entry) : [...artistCertificates, item];
    await saveSettingsValues({artist_certificates:JSON.stringify(nextCertificates)});
    artistCertificates = nextCertificates;
    if (uploadedPath && existing.storage_path) await sb.storage.from("portfolio").remove([existing.storage_path]);
    renderCertificates();
    $("#certificateDialog").close();
    toast("Сертификат сохранён");
  } catch (error) {
    if (uploadedPath) await sb.storage.from("portfolio").remove([uploadedPath]);
    console.error(error);
    toast("Не удалось сохранить сертификат");
  } finally {
    button.disabled = false;
  }
};

async function deleteCertificate(id) {
  const item = artistCertificates.find(entry => entry.id === id);
  if (!item || !confirm(`Удалить «${certificateTitle(item)}»?`)) return;
  try {
    const nextCertificates = artistCertificates.filter(entry => entry.id !== id);
    await saveSettingsValues({artist_certificates:JSON.stringify(nextCertificates)});
    artistCertificates = nextCertificates;
    if (item.storage_path) await sb.storage.from("portfolio").remove([item.storage_path]);
    renderCertificates();
    toast("Сертификат удалён");
  } catch (error) {
    console.error(error);
    toast("Не удалось удалить сертификат");
  }
}

const SOCIAL_NAMES = {instagram:"Instagram",whatsapp:"WhatsApp",facebook:"Facebook",telegram:"Telegram",tiktok:"TikTok",youtube:"YouTube",phone:"Телефон",other:"Ссылка"};
const SOCIAL_MARKS = {instagram:"IG",whatsapp:"WA",facebook:"f",telegram:"TG",tiktok:"TT",youtube:"YT",phone:"☎",other:"↗"};

function normalizeSocialUrl(type, raw) {
  const value = raw.trim();
  if (/^(https?:|tel:|mailto:)/i.test(value)) return value;
  const cleanHandle = value.replace(/^@/, "");
  if (type === "phone") return `tel:${value.replace(/[^+\d]/g, "")}`;
  if (type === "whatsapp") return `https://wa.me/${value.replace(/\D/g, "")}`;
  if (type === "telegram") return `https://t.me/${cleanHandle}`;
  if (type === "instagram") return `https://www.instagram.com/${cleanHandle}`;
  if (type === "facebook") return `https://www.facebook.com/${cleanHandle}`;
  if (type === "tiktok") return `https://www.tiktok.com/@${cleanHandle}`;
  if (type === "youtube") return `https://www.youtube.com/${value.startsWith("@") ? value : `@${cleanHandle}`}`;
  return `https://${value}`;
}

function renderSocials() {
  const list = $("#socialsList");
  const empty = $("#emptySocials");
  empty.style.display = socialLinks.length ? "none" : "block";
  list.innerHTML = socialLinks.map(item => `
    <article class="manager-card social-type-${esc(item.type)}">
      <span class="manager-mark">${esc(SOCIAL_MARKS[item.type] || "↗")}</span>
      <div class="manager-copy"><b>${esc(item.label_ru || SOCIAL_NAMES[item.type] || "Ссылка")}</b><small>${esc(item.display_value || "")} · <a href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.url)}</a></small></div>
      <div class="manager-actions"><button data-edit-social="${esc(item.id)}">Изменить</button><button class="danger" data-delete-social="${esc(item.id)}">Удалить</button></div>
    </article>`).join("");
  $$('[data-edit-social]').forEach(button => button.onclick = () => openSocial(button.dataset.editSocial));
  $$('[data-delete-social]').forEach(button => button.onclick = () => deleteSocial(button.dataset.deleteSocial));
}

function openSocial(id = "") {
  const form = $("#socialForm");
  form.reset();
  const item = socialLinks.find(entry => entry.id === id) || {};
  for (const key of ["id", "type", "label_ru", "label_hy", "label_en", "display_value", "url"]) form.elements[key].value = item[key] || (key === "type" ? "instagram" : "");
  $("#socialDialog").showModal();
}

$("#addSocial").onclick = () => openSocial();

$("#socialForm").onsubmit = async event => {
  event.preventDefault();
  const form = event.target;
  const fields = form.elements;
  const button = form.querySelector('[type="submit"]');
  const existing = socialLinks.find(entry => entry.id === fields.id.value) || {};
  const type = fields.type.value;
  const item = {
    id:existing.id || crypto.randomUUID(),
    type,
    label_ru:fields.label_ru.value.trim() || SOCIAL_NAMES[type],
    label_hy:fields.label_hy.value.trim() || fields.label_ru.value.trim() || SOCIAL_NAMES[type],
    label_en:fields.label_en.value.trim() || fields.label_ru.value.trim() || SOCIAL_NAMES[type],
    display_value:fields.display_value.value.trim(),
    url:normalizeSocialUrl(type, fields.url.value)
  };
  button.disabled = true;
  try {
    const nextSocialLinks = existing.id ? socialLinks.map(entry => entry.id === existing.id ? item : entry) : [...socialLinks, item];
    await saveSettingsValues({social_links:JSON.stringify(nextSocialLinks)});
    socialLinks = nextSocialLinks;
    renderSocials();
    $("#socialDialog").close();
    toast("Контакт сохранён");
  } catch (error) {
    console.error(error);
    toast("Не удалось сохранить контакт");
  } finally {
    button.disabled = false;
  }
};

async function deleteSocial(id) {
  const item = socialLinks.find(entry => entry.id === id);
  if (!item || !confirm(`Удалить «${item.label_ru || SOCIAL_NAMES[item.type]}» с сайта?`)) return;
  try {
    const nextSocialLinks = socialLinks.filter(entry => entry.id !== id);
    await saveSettingsValues({social_links:JSON.stringify(nextSocialLinks)});
    socialLinks = nextSocialLinks;
    renderSocials();
    toast("Контакт удалён с сайта");
  } catch (error) {
    console.error(error);
    toast("Не удалось удалить контакт");
  }
}

$("#socialForm").elements.type.onchange = event => {
  const form = event.target.form;
  const fields = form.elements;
  const name = SOCIAL_NAMES[event.target.value] || "Ссылка";
  if (!fields.label_ru.value) fields.label_ru.value = name;
  if (!fields.label_hy.value) fields.label_hy.value = name;
  if (!fields.label_en.value) fields.label_en.value = name;
};

const baseLoadAllV28 = loadAll;
loadAll = async function () {
  await baseLoadAllV28();
  await refreshExtraSettings();
};

setTimeout(() => {
  if (!$("#panel").classList.contains("hidden")) refreshExtraSettings();
}, 700);
