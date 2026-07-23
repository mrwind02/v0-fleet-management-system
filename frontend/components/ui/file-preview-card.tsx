import React from "react"
import { FileText, Download, FileImage, FileCode, FileIcon, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/utils/utils"

interface FilePreviewCardProps {
  fileName: string
  fileSize?: string
  fileType?: "pdf" | "image" | "document" | "code" | "other"
  uploadDate?: string
  uploadedBy?: string
  previewUrl?: string
  className?: string
}

export function FilePreviewCard({ 
  fileName, 
  fileSize, 
  fileType = "other",
  uploadDate,
  uploadedBy,
  previewUrl,
  className 
}: FilePreviewCardProps) {
  
  const getIcon = () => {
    switch (fileType) {
      case "pdf": return <FileText className="h-10 w-10 text-red-500" />
      case "image": return <FileImage className="h-10 w-10 text-blue-500" />
      case "document": return <FileText className="h-10 w-10 text-blue-700" />
      case "code": return <FileCode className="h-10 w-10 text-slate-700" />
      default: return <FileIcon className="h-10 w-10 text-muted-foreground" />
    }
  }

  return (
    <div className={cn("flex flex-col border rounded-xl overflow-hidden bg-card shadow-sm", className)}>
      {/* Preview Area */}
      <div className="h-64 bg-muted/40 w-full flex flex-col items-center justify-center border-b relative group">
        {previewUrl ? (
          <img src={previewUrl} alt={fileName} className="w-full h-full object-contain" />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
            {getIcon()}
            <span className="text-sm font-medium">Pré-visualização não disponível</span>
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
          <Button size="sm" variant="secondary" className="h-8">
            <Eye className="h-4 w-4 mr-2" /> Visualizar
          </Button>
          <Button size="sm" variant="default" className="h-8 bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="h-4 w-4 mr-2" /> Baixar
          </Button>
        </div>
      </div>
      
      {/* Metadata Area */}
      <div className="p-4 flex flex-col gap-1">
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-semibold text-sm truncate" title={fileName}>{fileName}</h4>
          {fileSize && <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded-full shrink-0">{fileSize}</span>}
        </div>
        
        {(uploadDate || uploadedBy) && (
          <div className="flex items-center text-xs text-muted-foreground mt-2">
            {uploadedBy && <span>Por {uploadedBy}</span>}
            {uploadedBy && uploadDate && <span className="mx-2">•</span>}
            {uploadDate && <span>{uploadDate}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
