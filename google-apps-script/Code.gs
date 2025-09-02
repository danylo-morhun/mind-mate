/**
 * Mind Mate - AI-помічник для Google Workspace університету
 * Основний файл з API ендпоінтами
 */

// Глобальні змінні
const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';
const SHEET_NAMES = {
  EMAILS: 'Emails',
  TEMPLATES: 'EmailTemplates',
  DOCUMENTS: 'Documents',
  GRADES: 'Grades',
  ANALYTICS: 'Analytics'
};

/**
 * Головна функція для обробки HTTP запитів
 */
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function doPut(e) {
  return handleRequest(e);
}

function doDelete(e) {
  return handleRequest(e);
}

/**
 * Обробка всіх HTTP запитів
 */
function handleRequest(e) {
  try {
    const method = e.parameter.method || e.postData?.contents ? 'POST' : 'GET';
    const path = e.parameter.path || '';
    
    // CORS заголовки
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    };
    
    // Обробка OPTIONS запиту
    if (method === 'OPTIONS') {
      return ContentService.createTextOutput('')
        .setHeaders(headers)
        .setMimeType(ContentService.MimeType.TEXT);
    }
    
    let response;
    
    // Маршрутизація запитів
    if (path.startsWith('/gmail/')) {
      response = handleGmailRequest(method, path, e);
    } else if (path.startsWith('/docs/')) {
      response = handleDocsRequest(method, path, e);
    } else if (path.startsWith('/grading/')) {
      response = handleGradingRequest(method, path, e);
    } else if (path.startsWith('/analytics/')) {
      response = handleAnalyticsRequest(method, path, e);
    } else if (path.startsWith('/ai/')) {
      response = handleAIRequest(method, path, e);
    } else if (path === '/health') {
      response = { status: 'OK', timestamp: new Date().toISOString() };
    } else {
      response = { error: 'Endpoint not found', path: path };
    }
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setHeaders(headers)
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error handling request:', error);
    return ContentService.createTextOutput(JSON.stringify({
      error: 'Internal server error',
      message: error.toString()
    }))
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    })
    .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Обробка запитів до Gmail API
 */
function handleGmailRequest(method, path, e) {
  const pathParts = path.split('/');
  const action = pathParts[2];
  const emailId = pathParts[3];
  
  switch (method) {
    case 'GET':
      if (action === 'emails') {
        return getEmails(e.parameter.maxResults || 50, e.parameter.query, e.parameter.category);
      } else if (action === 'emails' && emailId) {
        return getEmailById(emailId);
      } else if (action === 'templates') {
        return getEmailTemplates();
      }
      break;
      
    case 'POST':
      if (action === 'emails' && emailId && path.includes('categorize')) {
        const data = JSON.parse(e.postData.contents);
        return categorizeEmail(emailId, data.category);
      } else if (action === 'emails' && emailId && path.includes('priority')) {
        const data = JSON.parse(e.postData.contents);
        return setEmailPriority(emailId, data.priority);
      } else if (action === 'emails' && emailId && path.includes('labels')) {
        const data = JSON.parse(e.postData.contents);
        return applyEmailLabels(emailId, data.labels);
      } else if (action === 'emails' && emailId && path.includes('reply')) {
        const data = JSON.parse(e.postData.contents);
        return sendEmailReply(emailId, data.replyText, data.templateId);
      } else if (action === 'templates') {
        const data = JSON.parse(e.postData.contents);
        return createEmailTemplate(data);
      }
      break;
      
    case 'PUT':
      if (action === 'templates' && emailId) {
        const data = JSON.parse(e.postData.contents);
        return updateEmailTemplate(emailId, data);
      }
      break;
      
    case 'DELETE':
      if (action === 'templates' && emailId) {
        return deleteEmailTemplate(emailId);
      } else if (action === 'emails' && emailId) {
        return deleteEmail(emailId);
      }
      break;
  }
  
  return { error: 'Invalid Gmail request' };
}

/**
 * Отримання списку листів
 */
function getEmails(maxResults = 50, query = '', category = '') {
  try {
    const threads = GmailApp.search(query || 'in:inbox', 0, maxResults);
    const emails = [];
    
    threads.forEach(thread => {
      const messages = thread.getMessages();
      messages.forEach(message => {
        const email = {
          id: message.getId(),
          threadId: thread.getId(),
          subject: message.getSubject(),
          sender: message.getFrom(),
          recipients: message.getTo().split(',').map(email => email.trim()),
          body: message.getPlainBody(),
          timestamp: message.getDate(),
          category: categorizeEmailContent(message),
          priority: calculateEmailPriority(message),
          isRead: !message.isUnread(),
          labels: message.getThread().getLabels().map(label => label.getName()),
          attachments: getAttachments(message)
        };
        
        // Фільтрація по категорії
        if (!category || email.category === category) {
          emails.push(email);
        }
      });
    });
    
    return emails;
  } catch (error) {
    console.error('Error getting emails:', error);
    return { error: 'Failed to get emails', details: error.toString() };
  }
}

/**
 * Отримання листа за ID
 */
function getEmailById(emailId) {
  try {
    const message = GmailApp.getMessageById(emailId);
    const thread = message.getThread();
    
    return {
      id: message.getId(),
      threadId: thread.getId(),
      subject: message.getSubject(),
      sender: message.getFrom(),
      recipients: message.getTo().split(',').map(email => email.trim()),
      body: message.getPlainBody(),
      timestamp: message.getDate(),
      category: categorizeEmailContent(message),
      priority: calculateEmailPriority(message),
      isRead: !message.isUnread(),
      labels: thread.getLabels().map(label => label.getName()),
      attachments: getAttachments(message)
    };
  } catch (error) {
    console.error('Error getting email by ID:', error);
    return { error: 'Failed to get email', details: error.toString() };
  }
}

/**
 * AI-категорізація листа
 */
function categorizeEmailContent(message) {
  const subject = message.getSubject().toLowerCase();
  const body = message.getPlainBody().toLowerCase();
  const sender = message.getFrom().toLowerCase();
  
  // Ключові слова для категорізації
  const keywords = {
    academic: ['лекція', 'семінар', 'лабораторна', 'екзамен', 'залік', 'курс', 'навчання', 'студент'],
    administrative: ['наказ', 'розпорядження', 'звіт', 'планування', 'організація', 'адміністрація'],
    student_inquiry: ['питання', 'запит', 'допомога', 'консультація', 'пояснення'],
    meeting: ['зустріч', 'нарада', 'конференція', 'вебінар', 'семінар'],
    deadline: ['дедлайн', 'термін', 'останній день', 'до', 'не пізніше'],
    urgent: ['терміново', 'asap', 'негайно', 'критично', 'важливо'],
    general: []
  };
  
  // Перевіряємо кожну категорію
  for (const [category, words] of Object.entries(keywords)) {
    if (words.some(word => subject.includes(word) || body.includes(word))) {
      return category;
    }
  }
  
  // Перевіряємо домен відправника
  if (sender.includes('@university.edu') || sender.includes('@edu.ua')) {
    return 'academic';
  }
  
  return 'general';
}

/**
 * Розрахунок пріоритету листа
 */
function calculateEmailPriority(message) {
  const subject = message.getSubject().toLowerCase();
  const body = message.getPlainBody().toLowerCase();
  const sender = message.getFrom().toLowerCase();
  const labels = message.getThread().getLabels().map(label => label.getName());
  
  let score = 0;
  
  // Аналіз відправника
  if (sender.includes('admin') || sender.includes('dean')) score += 3;
  if (sender.includes('@university.edu') || sender.includes('@edu.ua')) score += 2;
  
  // Аналіз теми
  const urgentKeywords = ['urgent', 'asap', 'deadline', 'important', 'critical', 'терміново', 'важливо'];
  urgentKeywords.forEach(keyword => {
    if (subject.includes(keyword)) score += 2;
  });
  
  // Аналіз контенту
  if (body.includes('deadline')) score += 3;
  if (body.includes('meeting') || body.includes('зустріч')) score += 1;
  if (body.includes('exam') || body.includes('екзамен')) score += 2;
  
  // Аналіз міток
  if (labels.includes('URGENT')) score += 4;
  if (labels.includes('DEADLINE')) score += 3;
  
  if (score >= 8) return 'urgent';
  if (score >= 5) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

/**
 * Отримання вкладень листа
 */
function getAttachments(message) {
  try {
    const attachments = message.getAttachments();
    return attachments.map(attachment => ({
      id: attachment.getContentId() || attachment.getName(),
      name: attachment.getName(),
      size: attachment.getSize(),
      mimeType: attachment.getContentType()
    }));
  } catch (error) {
    console.error('Error getting attachments:', error);
    return [];
  }
}

/**
 * Категорізація листа
 */
function categorizeEmail(emailId, category) {
  try {
    const message = GmailApp.getMessageById(emailId);
    const thread = message.getThread();
    
    // Створюємо або оновлюємо мітку
    let label = GmailApp.getUserLabelByName(category);
    if (!label) {
      label = GmailApp.createLabel(category);
    }
    
    thread.addLabel(label);
    
    return { success: true, message: 'Email categorized successfully' };
  } catch (error) {
    console.error('Error categorizing email:', error);
    return { error: 'Failed to categorize email', details: error.toString() };
  }
}

/**
 * Встановлення пріоритету листа
 */
function setEmailPriority(emailId, priority) {
  try {
    const message = GmailApp.getMessageById(emailId);
    const thread = message.getThread();
    
    // Створюємо або оновлюємо мітку пріоритету
    const labelName = `Priority_${priority.toUpperCase()}`;
    let label = GmailApp.getUserLabelByName(labelName);
    if (!label) {
      label = GmailApp.createLabel(labelName);
    }
    
    // Видаляємо старі мітки пріоритету
    const priorityLabels = ['Priority_LOW', 'Priority_MEDIUM', 'Priority_HIGH', 'Priority_URGENT'];
    priorityLabels.forEach(priorityLabel => {
      const oldLabel = GmailApp.getUserLabelByName(priorityLabel);
      if (oldLabel) {
        thread.removeLabel(oldLabel);
      }
    });
    
    thread.addLabel(label);
    
    return { success: true, message: 'Email priority set successfully' };
  } catch (error) {
    console.error('Error setting email priority:', error);
    return { error: 'Failed to set email priority', details: error.toString() };
  }
}

/**
 * Застосування міток до листа
 */
function applyEmailLabels(emailId, labels) {
  try {
    const message = GmailApp.getMessageById(emailId);
    const thread = message.getThread();
    
    labels.forEach(labelName => {
      let label = GmailApp.getUserLabelByName(labelName);
      if (!label) {
        label = GmailApp.createLabel(labelName);
      }
      thread.addLabel(label);
    });
    
    return { success: true, message: 'Labels applied successfully' };
  } catch (error) {
    console.error('Error applying labels:', error);
    return { error: 'Failed to apply labels', details: error.toString() };
  }
}

/**
 * Відправка відповіді на лист
 */
function sendEmailReply(emailId, replyText, templateId) {
  try {
    const message = GmailApp.getMessageById(emailId);
    const thread = message.getThread();
    
    // Відправляємо відповідь
    thread.reply(replyText);
    
    // Позначаємо як прочитаний
    message.markRead();
    
    return { success: true, message: 'Reply sent successfully' };
  } catch (error) {
    console.error('Error sending reply:', error);
    return { error: 'Failed to send reply', details: error.toString() };
  }
}

/**
 * Видалення листа
 */
function deleteEmail(emailId) {
  try {
    const message = GmailApp.getMessageById(emailId);
    message.moveToTrash();
    
    return { success: true, message: 'Email deleted successfully' };
  } catch (error) {
    console.error('Error deleting email:', error);
    return { error: 'Failed to delete email', details: error.toString() };
  }
}

/**
 * Отримання шаблонів листів
 */
function getEmailTemplates() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.TEMPLATES);
    if (!sheet) {
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    const templates = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      templates.push({
        id: row[0],
        name: row[1],
        subject: row[2],
        body: row[3],
        category: row[4],
        variables: row[5] ? row[5].split(',') : [],
        isActive: row[6]
      });
    }
    
    return templates;
  } catch (error) {
    console.error('Error getting email templates:', error);
    return { error: 'Failed to get templates', details: error.toString() };
  }
}

/**
 * Створення шаблону листа
 */
function createEmailTemplate(templateData) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.TEMPLATES);
    if (!sheet) {
      return { error: 'Templates sheet not found' };
    }
    
    const templateId = Utilities.getUuid();
    const row = [
      templateId,
      templateData.name,
      templateData.subject,
      templateData.body,
      templateData.category,
      templateData.variables.join(','),
      templateData.isActive || true
    ];
    
    sheet.appendRow(row);
    
    return { 
      success: true, 
      message: 'Template created successfully',
      templateId: templateId
    };
  } catch (error) {
    console.error('Error creating template:', error);
    return { error: 'Failed to create template', details: error.toString() };
  }
}

/**
 * Оновлення шаблону листа
 */
function updateEmailTemplate(templateId, updates) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.TEMPLATES);
    if (!sheet) {
      return { error: 'Templates sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;
    
    // Знаходимо рядок з шаблоном
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === templateId) {
        rowIndex = i + 1;
        break;
      }
    }
    
    if (rowIndex === -1) {
      return { error: 'Template not found' };
    }
    
    // Оновлюємо дані
    if (updates.name !== undefined) sheet.getRange(rowIndex, 2).setValue(updates.name);
    if (updates.subject !== undefined) sheet.getRange(rowIndex, 3).setValue(updates.subject);
    if (updates.body !== undefined) sheet.getRange(rowIndex, 4).setValue(updates.body);
    if (updates.category !== undefined) sheet.getRange(rowIndex, 5).setValue(updates.category);
    if (updates.variables !== undefined) sheet.getRange(rowIndex, 6).setValue(updates.variables.join(','));
    if (updates.isActive !== undefined) sheet.getRange(rowIndex, 7).setValue(updates.isActive);
    
    return { success: true, message: 'Template updated successfully' };
  } catch (error) {
    console.error('Error updating template:', error);
    return { error: 'Failed to update template', details: error.toString() };
  }
}

/**
 * Видалення шаблону листа
 */
function deleteEmailTemplate(templateId) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.TEMPLATES);
    if (!sheet) {
      return { error: 'Templates sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    
    // Знаходимо та видаляємо рядок
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === templateId) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'Template deleted successfully' };
      }
    }
    
    return { error: 'Template not found' };
  } catch (error) {
    console.error('Error deleting template:', error);
    return { error: 'Failed to delete template', details: error.toString() };
  }
}

/**
 * Заглушки для інших модулів
 */
function handleDocsRequest(method, path, e) {
  return { error: 'Documents module not implemented yet' };
}

function handleGradingRequest(method, path, e) {
  return { error: 'Grading module not implemented yet' };
}

function handleAnalyticsRequest(method, path, e) {
  return { error: 'Analytics module not implemented yet' };
}

function handleAIRequest(method, path, e) {
  return { error: 'AI module not implemented yet' };
}
