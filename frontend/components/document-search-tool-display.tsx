import { DocumentSearchResult } from '@/lib/document-service';
import { Card } from './ui/card';
import { FileIcon, SparklesIcon } from './icons';

interface DocumentSearchToolDisplayProps {
  query: string;
  results: DocumentSearchResult[];
}

export function DocumentSearchToolDisplay({ 
  query, 
  results 
}: DocumentSearchToolDisplayProps) {
  return (
    <Card className="my-2 border bg-background/50 text-sm">
      <div className="flex flex-col rounded-md overflow-hidden">
        <div className="flex items-center justify-between p-3 bg-muted/50">
          <div className="flex items-center gap-2">
            <SparklesIcon size={14} />
            <span className="font-mono text-xs">searchDocuments</span>
          </div>
        </div>
        
        <div className="p-3 border-t border-muted/30">
          <div className="mb-2">
            <div className="text-muted-foreground text-xs mb-1">Input</div>
            <div className="bg-muted/30 p-2 rounded-md">
              <code className="text-xs font-mono whitespace-pre-wrap">
                {JSON.stringify({ 
                  query,
                  limit: 5,
                  similarity_threshold: 0.5
                }, null, 2)}
              </code>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="text-muted-foreground text-xs mb-1">Output</div>
            {results.length === 0 ? (
              <div className="bg-muted/30 p-2 rounded-md">
                <code className="text-xs font-mono">No documents found matching the query.</code>
              </div>
            ) : (
              <div className="bg-muted/30 p-2 rounded-md max-h-64 overflow-y-auto">
                <div className="mb-2 pb-2 border-b border-muted/30">
                  <span className="text-xs">Found {results.length} document matches</span>
                </div>
                {results.map((result) => (
                  <div key={result.chunk_id} className="mb-3 last:mb-0 border-b border-muted/30 last:border-0 pb-3 last:pb-0">
                    <div className="flex items-center gap-1 mb-1">
                      <FileIcon size={12} />
                      <span className="text-xs font-medium">{result.filename || `Document ${result.document_id.substring(0, 8)}...`}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{(result.similarity * 100).toFixed(0)}% match</span>
                    </div>
                    <div className="text-xs font-mono whitespace-pre-wrap pl-4 border-l-2 border-muted/30">
                      {result.chunk_text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
} 