import { BaseEmbeddingService } from './base.js';

export class FastEmbedService extends BaseEmbeddingService {
  // FastEmbed models typically produce 384-dimensional embeddings
  readonly vectorSize = 384;
  private readonly defaultModel = 'BAAI/bge-small-en-v1.5';
  private embedder: any = null;

  constructor(model?: string) {
    super(undefined, undefined, model || 'BAAI/bge-small-en-v1.5');
  }

  private async initializeEmbedder(): Promise<void> {
    if (!this.embedder) {
      // Dynamic import — cast to any to avoid NodeNext resolution picking up stale types
      const fastembed = await import('fastembed') as any;
      const FlagEmbedding = fastembed.FlagEmbedding;
      const EmbeddingModel = fastembed.EmbeddingModel;
      const modelName = this.model || this.defaultModel;
      // Map string model name to EmbeddingModel enum value, fallback to BGESmallENV15
      const modelEnum = Object.values(EmbeddingModel as Record<string, string>).includes(modelName)
        ? modelName
        : EmbeddingModel.BGESmallENV15;
      this.embedder = await FlagEmbedding.init({ model: modelEnum });
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
        // Convert to plain number[] for proper JSON serialization
        // Array.from() handles both Float32Array and regular arrays safely
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
