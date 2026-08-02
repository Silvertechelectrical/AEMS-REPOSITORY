export type StorageBackend = 'local' | 'cloud';

export type StoredDocumentInput = {
  athleteId: string;
  documentType: string;
  fileName: string;
  mimeType: string;
};

export class StorageService {
  constructor(private readonly backend: StorageBackend = 'local') {}

  async uploadDocument(input: StoredDocumentInput) {
    const fileUrl = this.backend === 'local'
      ? `/storage/${input.athleteId}/${input.fileName}`
      : `cloud://${input.athleteId}/${input.fileName}`;

    return {
      fileUrl,
      backend: this.backend,
      documentType: input.documentType,
      mimeType: input.mimeType,
    };
  }
}
