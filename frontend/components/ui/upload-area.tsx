"use client"

import * as React from "react"
import { cn } from "@/utils/utils"
import { UploadCloud, File, X } from "lucide-react"

export interface UploadAreaProps {
  className?: string
  onFileSelect?: (file: File) => void
  error?: boolean
  accept?: string
}

export function UploadArea({ className, onFileSelect, error, accept = "image/*,.pdf" }: UploadAreaProps) {
  const [dragActive, setDragActive] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    setSelectedFile(file)
    onFileSelect?.(file)
  }

  const onButtonClick = () => {
    inputRef.current?.click()
  }

  return (
    <div className={className}>
      {!selectedFile ? (
        <div
          className={cn(
            "relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-muted/20 transition-colors",
            dragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10" : "border-muted-foreground/25 hover:bg-muted/50",
            error && "border-destructive bg-destructive/5"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleChange}
          />
          <UploadCloud className={cn("h-8 w-8 mb-3", error ? "text-destructive" : "text-muted-foreground")} />
          <p className="text-sm font-medium mb-1">Clique ou arraste o arquivo aqui</p>
          <p className="text-xs text-muted-foreground">PDF, JPG, PNG até 10MB</p>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
          <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-100 text-blue-600 shrink-0">
            <File className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button 
            type="button"
            onClick={() => setSelectedFile(null)} 
            className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
