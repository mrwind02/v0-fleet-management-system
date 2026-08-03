import React, { useState } from "react"
import { FileText, Download, FileImage, FileCode, FileIcon, Eye, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/utils/utils"

interface FilePreviewCardProps {
  fileName: string
  fileSize?: string
  fileType?: "pdf" | "image" | "document" | "code" | "other"
  uploadDate?: string
  uploadedBy?: string
  previewUrl?: string
  fileUrl?: string
  className?: string
}

export function FilePreviewCard({ 
  fileName, 
  fileSize, 
  fileType = "other",
  uploadDate,
  uploadedBy,
  previewUrl,
  fileUrl,
  className 
}: FilePreviewCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [zoom, setZoom] = useState(1)

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5))

  const handleDownload = () => {
    const url = fileUrl || previewUrl
    if (!url) return
    
    // For internal/same-origin URLs, we can use the 'download' attribute on an anchor tag.
    // For external URLs, this will typically just navigate to the file, which the browser will then download or open.
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
  
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
        {(fileUrl || previewUrl) ? (
          fileType === "pdf" ? (
             <iframe src={fileUrl || previewUrl} className="w-full h-full pointer-events-none" title={fileName} />
          ) : previewUrl ? (
            <img src={previewUrl} alt={fileName} className="w-full h-full object-contain" />
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
              {getIcon()}
              <span className="text-sm font-medium">Pré-visualização não disponível</span>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
            {getIcon()}
            <span className="text-sm font-medium">Pré-visualização não disponível</span>
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
          <Button size="sm" variant="secondary" className="h-8" onClick={() => setIsPreviewOpen(true)}>
            <Eye className="h-4 w-4 mr-2" /> Visualizar
          </Button>
          <Button size="sm" variant="default" className="h-8 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" /> Baixar
          </Button>
        </div>
      </div>
      
      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="!max-w-[95vw] w-[95vw] h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="truncate pr-4">{fileName}</DialogTitle>
            {fileType !== "pdf" && (
              <div className="flex items-center gap-2 mr-12">
                <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 0.5}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-xs font-medium w-12 text-center">{Math.round(zoom * 100)}%</span>
                <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 3}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            )}
          </DialogHeader>
          <div className="flex-1 w-full mt-2 rounded-md overflow-hidden relative">
            <div 
              style={{ transform: fileType !== 'pdf' ? `scale(${zoom})` : 'none', transformOrigin: 'top center', transition: 'transform 0.2s ease-in-out' }}
              className="w-full h-full flex flex-col items-center justify-start min-h-full"
            >
              {fileUrl || previewUrl ? (
                fileType === "pdf" ? (
                  <iframe src={fileUrl || previewUrl} className="w-full h-full border-none overflow-hidden" title={fileName} style={{ background: 'white' }} />
                ) : previewUrl ? (
                  <img src={previewUrl} alt={fileName} className="max-w-full object-contain" />
                ) : (
                  <div className="flex flex-1 items-center justify-center text-muted-foreground">Pré-visualização não disponível para este tipo de arquivo</div>
                )
              ) : (
                <div className="flex flex-1 items-center justify-center text-muted-foreground">Nenhum arquivo disponível</div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
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
