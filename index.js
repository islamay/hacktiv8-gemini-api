import "dotenv/config"
import express from "express"
import multer from "multer"
import fs from "fs/promises"
import { GoogleGenAI, } from "@google/genai"
import { app } from "./app.js"

const upload = multer()
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY })

const GEMINI_MODEL = "gemini-2.5-flash"

const PORT = process.env.PORT
app.post("/generate-text", async (req, res) => {
  const { prompt } = req.body

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt
    })

    res.status(200).json({ result: response.text })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
})

app.post("/generate-from-image",
  upload.single("image"),
  async (req, res) => {
    const { prompt } = req.body
    const base64Image = req.file.buffer.toString("base64")

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          { text: prompt },
          { inlineData: { data: base64Image, mimeType: req.file.mimetype } }
        ]
      })

      // Todo :
      // 1. Tipe data contents
      // 2. Test Route

      res.status(200).json({ result: response.text })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  })

app.listen(PORT)
