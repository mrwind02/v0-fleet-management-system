"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ZoomIn, Download, X, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChecklistPhotoItem } from "@/types/checklist"

interface GalleryGridProps {
  photos: ChecklistPhotoItem[]
}

export function GalleryGrid({ photos }: GalleryGridProps) {
  const [selectedPhoto, setSelectedPhoto] = React.useState<ChecklistPhotoItem | null>(null)

  return (
    <div className="space-y-4">
      {/* Grid of Photo Thumbnails */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <motion.div
            key={photo.id}
            whileHover={{ y: -3 }}
            className="group bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="relative aspect-video bg-muted overflow-hidden cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
              <img
                src={photo.photoUrl}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="sm" variant="secondary" className="h-8 text-xs gap-1.5 font-semibold">
                  <ZoomIn className="h-3.5 w-3.5" /> Ampliar
                </Button>
              </div>
            </div>

            <div className="p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground truncate">{photo.title}</h4>
                <span className="text-[10px] text-muted-foreground font-mono">{photo.uploadDate}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed truncate" title={photo.caption}>
                {photo.caption}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal Zoom Overlay */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border/80 rounded-2xl overflow-hidden max-w-3xl w-full shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h3 className="text-sm font-bold text-foreground">{selectedPhoto.title}</h3>
                  <p className="text-xs text-muted-foreground">{selectedPhoto.caption}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setSelectedPhoto(null)} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="relative max-h-[70vh] bg-slate-950 flex items-center justify-center p-2">
                <img
                  src={selectedPhoto.photoUrl}
                  alt={selectedPhoto.title}
                  className="max-h-[65vh] w-auto object-contain rounded-lg shadow-lg"
                />
              </div>

              <div className="flex items-center justify-between p-3 border-t bg-muted/20 text-xs">
                <span className="text-muted-foreground font-mono">Enviado em {selectedPhoto.uploadDate}</span>
                <Button
                  size="sm"
                  onClick={() => alert(`Iniciando download de ${selectedPhoto.title}...`)}
                  className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold"
                >
                  <Download className="h-3.5 w-3.5" /> Baixar Imagem Original
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
