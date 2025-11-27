export interface DocumentComment {
  id: string;
  documentId: string;
  author: string;
  content: string;
  timestamp: Date;
  replies?: DocumentComment[];
}

let mockComments: DocumentComment[] = [
  {
    id: 'c1',
    documentId: '1',
    author: 'Петров П.П.',
    content: 'Документ потребує доопрацювання в розділі "Методика"',
    timestamp: new Date(Date.now() - 3600000),
    replies: [
      {
        id: 'r1',
        documentId: '1',
        author: 'Іванов І.І.',
        content: 'Погоджуюсь, давайте розширимо цей розділ',
        timestamp: new Date(Date.now() - 1800000)
      }
    ]
  },
  {
    id: 'c2',
    documentId: '2',
    author: 'Коваленко К.К.',
    content: 'Чудова методичка! Дякую за детальні інструкції.',
    timestamp: new Date(Date.now() - 7200000),
    replies: []
  }
];

export function getMockCommentsByDocumentId(documentId: string): DocumentComment[] {
  return mockComments
    .filter(comment => comment.documentId === documentId)
    .map(comment => ({
      ...comment,
      timestamp: new Date(comment.timestamp),
      replies: comment.replies?.map(reply => ({
        ...reply,
        timestamp: new Date(reply.timestamp)
      }))
    }));
}

export function getMockCommentById(commentId: string): DocumentComment | undefined {
  const comment = mockComments.find(c => c.id === commentId);
  if (!comment) return undefined;
  
  return {
    ...comment,
    timestamp: new Date(comment.timestamp),
    replies: comment.replies?.map(reply => ({
      ...reply,
      timestamp: new Date(reply.timestamp)
    }))
  };
}

export function addMockComment(comment: Omit<DocumentComment, 'id' | 'timestamp'>): DocumentComment {
  const newComment: DocumentComment = {
    ...comment,
    id: `c${Date.now()}`,
    timestamp: new Date(),
    replies: comment.replies || []
  };
  
  mockComments.push(newComment);
  return newComment;
}

export function updateMockComment(commentId: string, updates: Partial<DocumentComment>): DocumentComment | null {
  const index = mockComments.findIndex(c => c.id === commentId);
  if (index === -1) return null;
  
  mockComments[index] = { ...mockComments[index], ...updates };
  return {
    ...mockComments[index],
    timestamp: new Date(mockComments[index].timestamp),
    replies: mockComments[index].replies?.map(reply => ({
      ...reply,
      timestamp: new Date(reply.timestamp)
    }))
  };
}

export function deleteMockComment(commentId: string): boolean {
  const index = mockComments.findIndex(c => c.id === commentId);
  if (index === -1) return false;
  
  mockComments.splice(index, 1);
  return true;
}

export function addMockCommentReply(commentId: string, reply: Omit<DocumentComment, 'id' | 'timestamp' | 'documentId'>): DocumentComment | null {
  const comment = mockComments.find(c => c.id === commentId);
  if (!comment) return null;
  
  const newReply: DocumentComment = {
    ...reply,
    id: `r${Date.now()}`,
    documentId: comment.documentId,
    timestamp: new Date()
  };
  
  if (!comment.replies) {
    comment.replies = [];
  }
  
  comment.replies.push(newReply);
  
  return {
    ...comment,
    timestamp: new Date(comment.timestamp),
    replies: comment.replies.map(r => ({
      ...r,
      timestamp: new Date(r.timestamp)
    }))
  };
}

