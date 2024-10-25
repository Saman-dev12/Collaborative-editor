import { languages } from './languages'
import { clsx, type ClassValue } from "clsx"
import { toast } from 'sonner'
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const handleSaveFile = async (filename: string, code: string, language: string) => {
  const selectedLanguage = languages.find(lang => lang.value === language)
  const extension = selectedLanguage ? selectedLanguage.ext : '.txt'
  const fullFilename = filename.endsWith(extension) ? filename : `${filename}${extension}`
  
  const blob = new Blob([code], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fullFilename
  document.body.appendChild(link)
  
  return new Promise<void>((resolve, reject) => {
    link.onclick = () => {
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        resolve()
      }, 100)
    }
    link.click()
  }).then(() => {
    toast.success("File saved successfully")
  }).catch((error) => {
    console.error("Error saving file:", error)
    toast.error("Failed to save file")
  })
}