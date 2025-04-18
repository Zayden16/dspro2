import { useEffect, useState } from 'react';
import { DocumentSearchResult } from '@/lib/document-service';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { FileIcon, SparklesIcon } from './icons';
import { cn } from '@/lib/utils';
import { LoaderIcon } from './icons';

interface DocumentSearchResultsProps {
  query: string;
  onSelect?: (content: string) => void;
}

export function DocumentSearchResults({ 
  query, 
  onSelect 
}: DocumentSearchResultsProps) {
  const [results, setResults] = useState<DocumentSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function searchDocuments() {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/document-service', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: query.trim(),
            limit: 5,
            similarity_threshold: 0.5,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to search documents');
        }

        const data = await response.json();
        setResults(data.results || []);
      } catch (err) {
        console.error('Error searching documents:', err);
        setError('An error occurred while searching documents');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }

    searchDocuments();
  }, [query]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 border rounded-md bg-background/50 animate-in fade-in">
        <div className="flex items-center gap-2">
          <div className="animate-spin">
            <LoaderIcon size={16} />
          </div>
          <p className="text-sm font-medium">Searching documents...</p>
        </div>
        <div className="flex items-start gap-2 px-3 py-2 bg-muted/50 rounded-md">
          <div className="mt-0.5 shrink-0 text-muted-foreground">
            <SparklesIcon size={14} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-mono">searchDocuments({JSON.stringify({query, limit: 5, similarity_threshold: 0.5})})</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-2 p-4 border border-destructive rounded-md">
        <div className="flex items-center gap-2">
          <FileIcon size={16} />
          <p className="text-sm font-medium text-destructive">Error searching documents</p>
        </div>
        <p className="text-sm text-destructive/80">{error}</p>
      </div>
    );
  }

  if (results.length === 0 && query.trim()) {
    return (
      <div className="flex flex-col gap-2 p-4 border rounded-md">
        <div className="flex items-center gap-2">
          <FileIcon size={16} />
          <p className="text-sm font-medium">No documents found</p>
        </div>
        <p className="text-sm text-muted-foreground">No results matching "{query}" were found in your documents.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 border rounded-md bg-background/50 animate-in fade-in">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <FileIcon size={16} />
          <p className="text-sm font-medium">Document Search Results</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Found {results.length} document {results.length === 1 ? 'match' : 'matches'} for "{query}"
        </p>
      </div>
      
      <div className="flex flex-col gap-2 mt-2">
        {results.map((result) => (
          <Card
            key={result.chunk_id}
            className={cn(
              "p-3 text-sm transition-colors border-muted/50",
              onSelect && "hover:bg-accent hover:border-accent cursor-pointer"
            )}
            onClick={() => onSelect?.(result.chunk_text)}
          >
            <div className="flex items-start gap-2">
              <div className="mt-0.5 shrink-0 text-muted-foreground">
                <FileIcon size={14} />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="mb-1 font-medium truncate flex items-center justify-between">
                  <span>{result.filename || `Document ${result.document_id.substring(0, 8)}...`}</span>
                  <span className="text-xs text-muted-foreground font-mono">{(result.similarity * 100).toFixed(0)}% match</span>
                </div>
                <div className="text-muted-foreground text-xs font-mono px-2 py-1.5 bg-muted/50 rounded-md mb-2 overflow-x-auto">
                  <p className="line-clamp-3 whitespace-pre-wrap">{result.chunk_text}</p>
                </div>
                {onSelect && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-1 text-xs h-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(result.chunk_text);
                    }}
                  >
                    Use this content
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 