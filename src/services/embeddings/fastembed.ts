import { BaseEmbeddingService } from './base.js';

export class FastEmbedService extends BaseEmbeddingService {
  // FastEmbed models typically produce 384-dimensional embeddings
  readonly vectorSize = 384;
  private readonly defaultModel = 'BAAI/bge-small-en';
  private embedder: any = null;

  constructor(model?: string) {
    super(undefined, undefined, model || 'BAAI/bge-small-en');
  }

  private async initializeEmbedder(): Promise<void> {
    if (!this.embedder) {
      // Dynamic import to handle CommonJS module
      const fastembed = await import('fastembed');
      this.embedder = new fastembed.FastEmbed({
        model: this.model || this.defaultModel
      });
    }
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    await this.initializeEmbedder();
    if (!this.embedder) {
      throw new Error('FastEmbed embedder not initialized');
    }

    const embeddings: number[][] = [];
    // The fastembed library's embed() returns an AsyncGenerator that yields batches of embeddings
    for await (const batch of this.embedder.embed(texts)) {
      for (const embedding of batch) {
        // Convert Float32Array to number[] for proper JSON serialization
        embeddings.push(Array.from(embedding));
      }
    }
    return embeddings;
  }

  protected requiresApiKey(): boolean {
    return false;
  }

  protected validateConfig(): void {
    // No validation needed as FastEmbed runs locally
  }
}
