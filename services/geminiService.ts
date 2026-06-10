import { GoogleGenAI, GenerateContentResponse, Chat, FunctionDeclaration, Type } from "@google/genai";
import type { Document, FormFieldResult } from "../types";

// FIX: Initialize the AI client lazily to prevent crashes on startup
// if the API key is not immediately available.
let aiClient: GoogleGenAI | null = null;

// This function now ensures the client is created only when needed,
// and with a valid API key.
const getAiClient = (): GoogleGenAI => {
    if (!aiClient) {
        // FIX: Use `import.meta.env.VITE_API_KEY` to correctly access environment variables in a Vite project. This is the standard and secure way to handle client-side keys.
        const apiKey = import.meta.env.VITE_API_KEY;

        if (!apiKey) {
            throw new Error("Gemini API key not found. Please set 'VITE_API_KEY' in your deployment environment variables.");
        }
        aiClient = new GoogleGenAI({ apiKey });
    }
    return aiClient;
};

const correctionTool: FunctionDeclaration = {
    name: 'correctDocumentInformation',
    description: 'Corrects a piece of information within a specific document. Use this when the user states that a fact from their documents is wrong and provides a correction.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            fileName: {
                type: Type.STRING,
                description: 'The name of the document file to be corrected, e.g., "passport.jpeg".',
            },
            incorrectText: {
                type: Type.STRING,
                description: 'The specific, exact snippet of incorrect text that needs to be replaced.',
            },
            correctText: {
                type: Type.STRING,
                description: 'The new, correct text that will replace the incorrect snippet.',
            },
        },
        required: ['fileName', 'incorrectText', 'correctText'],
    },
};


export const extractTextFromImage = async (file: File): Promise<string> => {
  try {
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const imagePart = {
      inlineData: {
        mimeType: file.type,
        data: base64Data,
      },
    };

    const textPart = {
      text: "Extract all visible text from this document. Present it clearly as raw text. Do not add any formatting or explanations.",
    };

    const response: GenerateContentResponse = await getAiClient().models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: { parts: [imagePart, textPart] },
    });

    return response.text;
  } catch (error) {
    console.error("Error extracting text from image:", error);
    throw new Error("Failed to analyze the document. Please try a clearer image.");
  }
};

export const createChatSession = (): Chat => {
  const chat = getAiClient().chats.create({
    model: 'gemini-3.1-flash-lite',
    config: {
      systemInstruction: "You are DocuMind, a helpful personal assistant. Your knowledge is strictly limited to the documents provided in the context. Answer the user's questions based only on this information. If the answer isn't in the documents, state that you cannot find the information in the provided documents. If the user tells you a piece of information is incorrect, you must use the `correctDocumentInformation` tool to fix it. Be concise and direct.",
      tools: [{ functionDeclarations: [correctionTool] }],
    },
  });
  return chat;
};

export const getContextMessage = (documents: Document[]): string => {
    if (documents.length === 0) return "CONTEXT: The user has not uploaded any documents yet.";
    const context = documents.map(doc => `Document: ${doc.fileName}\nContent:\n${doc.extractedText}`).join('\n\n---\n\n');
    return `CONTEXT: Here are the user's documents. Use this information to answer all future questions.\n\n${context}`;
};

export const fillFormFromDocuments = async (formFile: File, documents: Document[]): Promise<FormFieldResult[]> => {
    try {
        const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(formFile);
        });

        const formImagePart = {
            inlineData: {
                mimeType: formFile.type,
                data: base64Data,
            },
        };

        const documentContext = documents.map(doc => `Document: ${doc.fileName}\nContent:\n${doc.extractedText}`).join('\n\n---\n\n');
        
        const currentDate = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format

        const promptText = `
You are an expert form-filling assistant. Your task is to analyze the provided image of a form and fill in the blanks using the information available in the user's documents.

**Instructions:**
1.  Carefully examine the form in the image to identify all fields, questions, and blank spaces that need to be filled.
2.  Search through the provided document context to find the corresponding information for each field.
3.  **Special Rule for Dates:** If you identify a field that requires today's date (e.g., "Date", "Signature Date", "Today's Date"), you MUST use the following value: ${currentDate}. For this specific field, set the source document to "System (Current Date)".
4.  For each field you can fill, create a JSON object with the field name, the value you found, and the name of the source document.
5.  If you cannot find the information for a specific field (and it is not today's date), use "Information not found" as the value.
6.  Return an array of these JSON objects.

**User's Documents Context:**
${documentContext}
`;

        const textPart = { text: promptText };

        const responseSchema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    fieldName: {
                        type: Type.STRING,
                        description: 'The label or name of the form field (e.g., "Full Name", "Date of Birth").',
                    },
                    suggestedValue: {
                        type: Type.STRING,
                        description: 'The value found in the documents to fill the field (e.g., "John Doe", "1990-01-15"). Use "Information not found" if no value is available.',
                    },
                    sourceDocument: {
                        type: Type.STRING,
                        description: 'The file name of the document where the information was found (e.g., "passport.jpeg").',
                    },
                },
                required: ['fieldName', 'suggestedValue', 'sourceDocument'],
            },
        };

        const response: GenerateContentResponse = await getAiClient().models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: { parts: [formImagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr) as FormFieldResult[];

    } catch (error) {
        console.error("Error filling form:", error);
        if (error instanceof SyntaxError) {
             throw new Error("Failed to get a valid analysis from the AI. The response was not in the expected format.");
        }
        throw new Error("Failed to analyze the form. Please try again with a clearer image or check your documents.");
    }
};
