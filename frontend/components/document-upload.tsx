import { useState } from 'react';
import { Button } from './ui/button';
import { UploadIcon, FileIcon } from './icons';
import { toast } from 'sonner';
import { uploadDocument } from '@/lib/document-service';
import { Card } from './ui/card';
import { LoaderIcon } from './icons';

interface DocumentUploadProps {
  onSuccess?: (documentId: string) => void;
}

export function DocumentUpload({ onSuccess }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      setSelectedFile(null);
      return;
    }
    
    const file = files[0];
    setSelectedFile(file);
  };
  
  const handleFileUpload = async () => {
    if (!selectedFile) return;
    
    // Check if the file is a PDF, DOC, DOCX, TXT or email
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'message/rfc822'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Invalid file type. Please upload a PDF, DOC, DOCX, TXT or email file.');
      return;
    }
    
    setIsUploading(true);
    
    try {
      const result = await uploadDocument(selectedFile);
      toast.success('Document uploaded successfully');
      setSelectedFile(null);
      if (onSuccess) {
        onSuccess(result.document_id);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Helper function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <Card className="border p-4 rounded-md bg-background/50 animate-in fade-in">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <UploadIcon size={16} />
          <p className="text-sm font-medium">Document Upload</p>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Upload a document to search or reference. Supported formats: PDF, DOC, DOCX, TXT, or email files.
        </p>
        
        <div className="border-2 border-dashed rounded-md border-muted-foreground/20 p-4 text-center hover:border-muted-foreground/40 transition-colors">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
            accept=".pdf,.doc,.docx,.txt,.eml,.msg"
          />
          <label 
            htmlFor="file-upload" 
            className="flex flex-col items-center justify-center gap-2 cursor-pointer"
          >
            <div className="text-muted-foreground">
              <UploadIcon size={24} />
            </div>
            <span className="text-sm font-medium">
              {selectedFile ? selectedFile.name : "Click to select a file"}
            </span>
            {selectedFile && (
              <span className="text-xs text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </span>
            )}
          </label>
        </div>
        
        {selectedFile && (
          <div className="flex items-center gap-3">
            <Button
              onClick={handleFileUpload}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <div className="mr-2 animate-spin">
                    <LoaderIcon size={16} />
                  </div>
                  Uploading...
                </>
              ) : (
                <>
                  <div className="mr-2">
                    <UploadIcon size={16} />
                  </div>
                  Upload Document
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setSelectedFile(null)}
              disabled={isUploading}
              className="flex-shrink-0"
            >
              Cancel
            </Button>
          </div>
        )}
        
        <div className="flex flex-col gap-1 mt-1">
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <FileIcon size={12} />
            <span>Documents are processed with PII redaction enabled by default</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <FileIcon size={12} />
            <span>Documents are chunked and vectorized for semantic search</span>
          </div>
        </div>
      </div>
    </Card>
  );
} 