/**
 * Функция doGet всегда возвращает index.html – базу для нашего SPA.
 */
function doGet(e) {
  // Список разрешённых аккаунтов
  const allowedEmails = [
    "dmitrii.bogdanov@humanasset.cz",
    "ruszlan.lupics@humanasset.cz",
    "volodymyr.pahula@humanasset.cz",
    "artur.lupics@humanasset.cz",
    "ivan.ivanov@humanasset.cz",
    "victor.surdu@humanasset.cz",
    "christmastoysdayinfo@gmail.com",
    "volodymyr.nazarenko@humanasset.cz",
    "nicolai.chiriac@humanasset.cz"
  ];
  
  var userEmail = Session.getActiveUser().getEmail();
  
  // Если пользователь не авторизован или его email не в списке разрешённых – показываем сообщение об ошибке.
  if (!userEmail) {
    return HtmlService.createHtmlOutput("Пожалуйста, авторизуйтесь через Google аккаунт.");
  }
  
  if (allowedEmails.indexOf(userEmail) === -1) {
    const msg = "Доступ запрещен для аккаунта: " + userEmail;
    return HtmlService
      .createHtmlOutput(
        '<div style="font-size:2.5rem; text-align:center; margin-top:2em;">'
        + msg +
        '</div>'
      )
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  var template = HtmlService.createTemplateFromFile('index');
  
  template.allData = {
    dormitories: getDormitories(),
    rooms: getAllRooms(),
    residents: getAllResidents(),
    logs: getLogs()
  };

  template.currentUserEmail = Session.getActiveUser().getEmail();

  return template.evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}



function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

const SPREADSHEET_ID = '1cSbNimXTtwpvmrAaVNEYWjivMZR9Xmt7QqK2V15u-zc';

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

/* ============ Функции работы с данными ============ */

function getDormitories() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName("Dormitories");
  if (!sheet) {
    sheet = ss.insertSheet("Dormitories");
    sheet.appendRow(["ID", "Name", "City", "ImageUrl", "IsActive"]);
  }
  const data = sheet.getDataRange().getValues();
  data.shift();
  return data;
}

function addDormitory(name, city, imageUrl, isActive) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName("Dormitories");
  if (!sheet) {
    sheet = ss.insertSheet("Dormitories");
    sheet.appendRow(["ID", "Name", "City", "ImageUrl"]);
  }
  const id = new Date().getTime();
  sheet.appendRow([id, name, city, imageUrl, isActive]);
  return id;
}

/**
 * Обновляет данные общежития: название, город и картинку
 * @param {number|string} id — ID общежития
 * @param {string} newName — новое название
 * @param {string} newCity — новый город
 * @param {string} newImageUrl — новый URL картинки
 */
function updateDormitory(id, newName, newCity, newImageUrl, newIsActive) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName("Dormitories");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.getRange(i+1, 2).setValue(newName);
      sheet.getRange(i+1, 3).setValue(newCity);
      sheet.getRange(i+1, 4).setValue(newImageUrl);
      sheet.getRange(i+1, 5).setValue(newIsActive);
      return true;
    }
  }
  return false;
}

function getRooms(dormitoryId) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName("Rooms");
  if (!sheet) {
    sheet = ss.insertSheet("Rooms");
    sheet.appendRow(["ID", "DormitoryID", "Name", "MaxCapacity", "IsActive"]);
  }
  const data = sheet.getDataRange().getValues();
  data.shift();
  return data.filter(row => row[1] == dormitoryId);
}

function getAllRooms() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName("Rooms");
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  data.shift();
  return data;
}

function addRoom(dormitoryId, name, maxCapacity, isActive) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName("Rooms");
  if (!sheet) {
    sheet = ss.insertSheet("Rooms");
    sheet.appendRow(["ID", "DormitoryID", "Name", "MaxCapacity"]);
  }
  const id = new Date().getTime();
  sheet.appendRow([id, dormitoryId, name, maxCapacity, isActive]);
  return id;
}

/**
 * Обновляет данные комнаты: название и вместимость
 * @param {number|string} id — ID комнаты
 * @param {string} newName — новое название комнаты
 * @param {number|string} newCapacity — новое значение MaxCapacity
 */
function updateRoom(id, newName, newCapacity, newIsActive) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName("Rooms");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.getRange(i+1, 3).setValue(newName);
      sheet.getRange(i+1, 4).setValue(newCapacity);
      sheet.getRange(i+1, 5).setValue(newIsActive);
      return true;
    }
  }
  return false;
}


function getResidents(roomId) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName("Residents");
  if (!sheet) {
    sheet = ss.insertSheet("Residents");
    sheet.appendRow(["ID", "DormitoryID", "RoomID", "CheckInDate", "EvictionDate", "Surname", "Name", "Phone", "Note", "Status", "UniquePrice"]);
  }
  const data = sheet.getDataRange().getValues();
  data.shift();
  return data.filter(row => row[2] == roomId && row[9] == "active")
             .sort((a, b) => a[5].localeCompare(b[5]));
}

function getAllResidents() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName("Residents");
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  data.shift();
  return data;
}

function addResident(dormitoryId, roomId, checkInDate, surname, name, phone, note, status, uniquePrice) {
  if (!checkInDate || !surname || !name) {
    throw new Error("Пожалуйста, заполните все обязательные поля.");
  }
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName("Residents");
  if (!sheet) {
    sheet = ss.insertSheet("Residents");
    sheet.appendRow(["ID", "DormitoryID", "RoomID", "CheckInDate", "EvictionDate", "Surname", "Name", "Phone", "Note", "Status", "UniquePrice"]);
  }
  
  // Получаем все данные записей
  const data = sheet.getDataRange().getValues();
  // Пропускаем первую строку (заголовок)
  for (let i = 1; i < data.length; i++) {
    let row = data[i];
    // Если у записи совпадают фамилия и имя, EvictionDate пустой и запись относится к другой комнате:
    if (row[5] === surname &&
        row[6] === name &&
        row[4] === "" &&
        row[2] != roomId &&
        (row[9] === "active" || row[9] === "samoplatce" || row[9] === "marked")) {
      var existingDorm = getDormitoryById(row[1]);
      var existingRoom = getRoomById(row[2]);
      var dormName = existingDorm ? existingDorm[1] : "неизвестно";
      var roomName = existingRoom ? existingRoom[2] : "неизвестно";
      throw new Error("Жилец " + surname + " " + name + " уже проживает в общежитии " + dormName + ", комнате " + roomName + ".");
    }
  }
  
  // Если дубликата не найдено, добавляем новую запись
  const id = new Date().getTime();
  sheet.appendRow([id, dormitoryId, roomId, checkInDate, "", surname, name, phone || "", note || "", status, uniquePrice || ""]);
  
  var room = getRoomById(roomId);
  var dorm = getDormitoryById(dormitoryId);
  var roomName = room ? room[2] : "";
  var dormName = dorm ? dorm[1] : "";
  // Логируем заселение
  addLog(surname + " " + name, "Заселён(а) в '" + roomName + "' (" + dormName + "), " + checkInDate);
  
  return id;
}


function evictResident(id, evictionDate) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName("Residents");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.getRange(i+1, 5).setValue(evictionDate);
      var newStatus = (data[i][9] === "samoplatce") ? "evicted samoplatce" : "evicted";
      sheet.getRange(i+1, 10).setValue(newStatus);
      SpreadsheetApp.flush();
      
      var dorm = getDormitoryById(data[i][1]);
      var room = getRoomById(data[i][2]);
      var roomName = room ? room[2] : "";
      var dormName = dorm ? dorm[1] : "";
      // Сообщение: "Выселен из [roomName] ([dormName]), [evictionDate]"
      addLog(data[i][5] + " " + data[i][6], "Выселен из '" + roomName + "' (" + dormName + "), " + evictionDate);
      return true;
    }
  }
  return false;
}

function relocateResident(id, targetDormitoryId, targetRoomId, relocationDate) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName("Residents");
  const data = sheet.getDataRange().getValues();

  // Найдем данные жильца по переданному id
  let providedResident = null;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      providedResident = data[i];
      break;
    }
  }
  if (!providedResident) return false;

  const surname = providedResident[5];
  const name = providedResident[6];

  // Найдем актуальную (последнюю) запись проживания для данного жильца:
  // условие: совпадают фамилия и имя, EvictionDate пустой и статус либо "active", либо "samoplatce"
  let selectedRowData = null;
  let selectedRowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    let row = data[i];
    if (row[5] === surname && row[6] === name && row[4] === "" &&
        (row[9] === "active" || row[9] === "samoplatce")) {
      if (!selectedRowData) {
        selectedRowData = row;
        selectedRowIndex = i;
      } else {
        // Преобразуем дату заселения (формат dd.MM.yyyy) в объект Date для сравнения
        let currentParts = selectedRowData[3].split('.');
        let currentDate = new Date(currentParts[2], currentParts[1] - 1, currentParts[0]);
        let candidateParts = row[3].split('.');
        let candidateDate = new Date(candidateParts[2], candidateParts[1] - 1, candidateParts[0]);
        if (candidateDate > currentDate) {
          selectedRowData = row;
          selectedRowIndex = i;
        }
      }
    }
  }

  if (!selectedRowData) return false;

  // Рассчитаем дату выселения для выбранной записи (за день до даты переселения)
  var parts = relocationDate.split('.');
  var d = new Date(parts[2], parts[1] - 1, parts[0]);
  var oldEvictionDate = new Date(d);
  oldEvictionDate.setDate(oldEvictionDate.getDate() - 1);
  var formattedOldEviction = ("0" + oldEvictionDate.getDate()).slice(-2) + '.' +
                               ("0" + (oldEvictionDate.getMonth() + 1)).slice(-2) + '.' +
                               oldEvictionDate.getFullYear();

  var oldStatus = (selectedRowData[9] === "samoplatce") ? "relocated samoplatce" : "relocated";
  sheet.getRange(selectedRowIndex + 1, 5).setValue(formattedOldEviction);
  sheet.getRange(selectedRowIndex + 1, 10).setValue(oldStatus);

  // Получаем данные комнат и общежитий для формирования сообщения
  var oldRoom = getRoomById(selectedRowData[2]);
  var oldDorm = getDormitoryById(selectedRowData[1]);
  var newRoom = getRoomById(targetRoomId);
  var newDorm = getDormitoryById(targetDormitoryId);
  var oldRoomName = oldRoom ? oldRoom[2] : "";
  var oldDormName = oldDorm ? oldDorm[1] : "";
  var newRoomName = newRoom ? newRoom[2] : "";
  var newDormName = newDorm ? newDorm[1] : "";

  // Логируем переселение
  addLog(selectedRowData[5] + " " + selectedRowData[6], 
         "Переселён из '" + oldRoomName + "' (" + oldDormName + ") в '" + newRoomName + "' (" + newDormName + "), " + relocationDate);

  // Создаем новую запись заселения
  var newCheckInDateStr = relocationDate;
  var newStatus = (selectedRowData[9] === "samoplatce") ? "samoplatce" : "active";
  const newId = new Date().getTime();
  sheet.appendRow([newId, targetDormitoryId, targetRoomId, newCheckInDateStr, "", 
                   selectedRowData[5], selectedRowData[6], selectedRowData[7], selectedRowData[8], newStatus]);
  return newId;
}


/**
 * Точная копия relocateResident, но старую запись помечаем как evicted[ samoplatce ]
 */
function reRelocateResident(id, targetDormitoryId, targetRoomId, relocationDate) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName("Residents");
  const data = sheet.getDataRange().getValues();

  // Найдем данные жильца по переданному id
  let providedResident = null;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      providedResident = data[i];
      break;
    }
  }
  if (!providedResident) return false;

  const surname = providedResident[5];
  const name = providedResident[6];

  // Найдем актуальную (последнюю) запись проживания для данного жильца:
  // условие: совпадают фамилия и имя, EvictionDate пустой и статус либо "active", либо "samoplatce"
  let selectedRowData = null;
  let selectedRowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    let row = data[i];
    if (row[5] === surname && row[6] === name && row[4] === "" &&
        (row[9] === "active" || row[9] === "samoplatce")) {
      if (!selectedRowData) {
        selectedRowData = row;
        selectedRowIndex = i;
      } else {
        // Преобразуем дату заселения (формат dd.MM.yyyy) в объект Date для сравнения
        let currentParts = selectedRowData[3].split('.');
        let currentDate = new Date(currentParts[2], currentParts[1] - 1, currentParts[0]);
        let candidateParts = row[3].split('.');
        let candidateDate = new Date(candidateParts[2], candidateParts[1] - 1, candidateParts[0]);
        if (candidateDate > currentDate) {
          selectedRowData = row;
          selectedRowIndex = i;
        }
      }
    }
  }

  if (!selectedRowData) return false;

  // Рассчитаем дату выселения для выбранной записи (за день до даты переселения)
  var parts = relocationDate.split('.');
  var d = new Date(parts[2], parts[1] - 1, parts[0]);
  var oldEvictionDate = new Date(d);
  oldEvictionDate.setDate(oldEvictionDate.getDate() - 1);
  var formattedOldEviction = ("0" + oldEvictionDate.getDate()).slice(-2) + '.' +
                               ("0" + (oldEvictionDate.getMonth() + 1)).slice(-2) + '.' +
                               oldEvictionDate.getFullYear();

  var oldStatus = (selectedRowData[9] === "samoplatce") ? "relocated samoplatce" : "evicted";
  sheet.getRange(selectedRowIndex + 1, 5).setValue(formattedOldEviction);
  sheet.getRange(selectedRowIndex + 1, 10).setValue(oldStatus);

  // Получаем данные комнат и общежитий для формирования сообщения
  var oldRoom = getRoomById(selectedRowData[2]);
  var oldDorm = getDormitoryById(selectedRowData[1]);
  var newRoom = getRoomById(targetRoomId);
  var newDorm = getDormitoryById(targetDormitoryId);
  var oldRoomName = oldRoom ? oldRoom[2] : "";
  var oldDormName = oldDorm ? oldDorm[1] : "";
  var newRoomName = newRoom ? newRoom[2] : "";
  var newDormName = newDorm ? newDorm[1] : "";

  // Логируем переселение
  addLog(selectedRowData[5] + " " + selectedRowData[6], 
         "Переселён из '" + oldRoomName + "' (" + oldDormName + ") в '" + newRoomName + "' (" + newDormName + "), " + relocationDate);

  // Создаем новую запись заселения
  var newCheckInDateStr = relocationDate;
  var newStatus = (selectedRowData[9] === "samoplatce") ? "samoplatce" : "active";
  const newId = new Date().getTime();
  sheet.appendRow([newId, targetDormitoryId, targetRoomId, newCheckInDateStr, "", 
                   selectedRowData[5], selectedRowData[6], selectedRowData[7], selectedRowData[8], newStatus]);
  return newId;
}


function getResidentDetails(residentId) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName("Residents");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == residentId) {
      return data[i];
    }
  }
  return null;
}

function getResidentsByName(query) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName("Residents");
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  data.shift();
  query = query.toLowerCase().replace(/\s/g, "");
  return data.filter(row => {
    const surname = row[5].toString().toLowerCase().replace(/\s/g, "");
    const name = row[6].toString().toLowerCase().replace(/\s/g, "");
    return surname.indexOf(query) !== -1 || name.indexOf(query) !== -1;
  });
}

function addLog(residentFullName, details) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName("Logs");
  if (!sheet) {
    sheet = ss.insertSheet("Logs");
    sheet.appendRow(["Дата", "Google Аккаунт", "Жилец", "Детали"]);
  }
  const date = new Date();
  const email = Session.getActiveUser().getEmail();
  sheet.appendRow([date, email, residentFullName, details]);
}

function getLogs() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName("Logs");
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  data.shift();
  return data;
}

function getDormitoryById(id) {
  var dorms = getDormitories();
  for (var i = 0; i < dorms.length; i++) {
    if (dorms[i][0] == id) return dorms[i];
  }
  return null;
}

function getRoomById(id) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName("Rooms");
  if (!sheet) return null;
  const data = sheet.getDataRange().getValues();
  data.shift();
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] == id) return data[i];
  }
  return null;
}

function markResidentForDeletion(residentId) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName("Residents");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(residentId)) {
      // Обновляем ячейку со статусом, например, ставим "marked"
      sheet.getRange(i + 1, 10).setValue("marked");
      return true;
    }
  }
  return false;
}

function deleteResident(residentId) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName("Residents");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(residentId)) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

/**
 * Обновляет данные существующего жильца.
 * @param {string|number} id — ID записи жильца
 * @param {string} checkInDate — дата заселения в формате "dd.MM.yyyy"
 * @param {string} surname
 * @param {string} name
 * @param {string} phone
 * @param {string} note
 */
function updateResident(id, checkInDate, surname, name, phone, note) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName("Residents");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      // Столбцы: 1-ID, 2-DormID, 3-RoomID, 4-CheckInDate, 5-EvictionDate,
      // 6-Surname, 7-Name, 8-Phone, 9-Note, 10-Status
      sheet.getRange(i+1, 4).setValue(checkInDate);   // CheckInDate
      sheet.getRange(i+1, 6).setValue(surname);
      sheet.getRange(i+1, 7).setValue(name);
      sheet.getRange(i+1, 8).setValue(phone);
      sheet.getRange(i+1, 9).setValue(note);
      // Можно добавить лог изменения:
      addLog(surname + " " + name, "Обновлены данные жильца, дата заселения: " + checkInDate);
      return true;
    }
  }
  throw new Error("Жилец с ID " + id + " не найден");
}


