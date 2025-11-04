import React, { useState, useEffect, useRef } from 'react';
import type { User, Document, ChatMessage, ChatSession, FormFieldResult, FormAnalysis } from '../types';
import { createChatSession, getContextMessage, extractTextFromImage, fillFormFromDocuments } from '../services/geminiService';
import type { GenerateContentResponse, Part } from "@google/genai";

interface MainAppProps {
  user: User;
  onLogout: () => void;
  onAddDocument: (doc: Document) => void;
  onDeleteDocument: (docId: string) => void;
  onUpdateDocument: (docId: string, newText: string) => void;
  onAddFormAnalysis: (analysis: FormAnalysis) => void;
  onDeleteFormAnalysis: (analysisId: string) => void;
}


// Icons
const MenuIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);
const XIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);
const DocumentIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);
const NoteIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);
const PaperclipIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.122 2.122l7.81-7.81" />
    </svg>
);
const EditIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);
const TrashIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.077-2.09.921-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);
const SendIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
    </svg>
);
const CopyIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
    </svg>
);
const AnalysisIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
    </svg>
);


export const MainApp: React.FC<MainAppProps> = ({ user, onLogout, onAddDocument, onDeleteDocument, onUpdateDocument, onAddFormAnalysis, onDeleteFormAnalysis }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [editedText, setEditedText] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzingForm, setIsAnalyzingForm] = useState(false);
  const [formAnalysisResult, setFormAnalysisResult] = useState<FormFieldResult[] | null>(null);
  const [formAnalysisError, setFormAnalysisError] = useState<string | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [currentFormAnalysisTitle, setCurrentFormAnalysisTitle] = useState<string>("");
  
  const chatSessionRef = useRef<ChatSession>({ chat: null, isInitialized: false });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // We reset the chat session here, but we don't create a new one immediately.
    // This avoids calling the Gemini API setup on component mount and prevents a startup crash.
    // The session will be created on-demand when the user sends their first message.
    chatSessionRef.current = { chat: null, isInitialized: false };
    setMessages([{role: 'model', content: `Hello ${user.username}! Ask me anything about your documents.`}]);
  }, [user.documents, user.username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (toast) {
        const timer = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string) => {
    setToast(message);
  };
  
  const removeAttachedImage = () => {
    setAttachedImage(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };
  
  const handleApiError = (error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    const lowerCaseError = errorMessage.toLowerCase();
    
    // FIX: Provide a more specific error message for common API key issues,
    // guiding the user towards the correct solution (checking key restrictions).
    if (lowerCaseError.includes("api key not valid") || lowerCaseError.includes("api key is not enabled")) {
        return "The API key is not valid or not configured for browser use. Please check your Gemini API key settings and ensure the website's domain is on the allowed list of referrers.";
    }
    
    if (lowerCaseError.includes("api key")) {
      return "An API key has not been configured correctly. The application cannot connect to the AI service. Please ensure the API_KEY is set in the deployment environment.";
    }
    
    return errorMessage;
  }

  const handleSendMessage = async () => {
    if ((input.trim() === '' && !attachedImage) || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input, image: imagePreview ?? undefined };
    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = input;
    const currentImage = attachedImage;
    
    setInput('');
    removeAttachedImage();
    setIsLoading(true);

    try {
        const session = chatSessionRef.current;
        if (!session.chat) {
            session.chat = createChatSession();
        }

        if (!session.isInitialized) {
            const contextMessage = getContextMessage(user.documents);
            await session.chat.sendMessage({ message: contextMessage });
            session.isInitialized = true;
        }

        let messageToSend: { message: string | (string | Part)[] };

        if (currentImage) {
            const base64Data = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(currentImage);
            });
            const imagePart: Part = {
                inlineData: {
                    mimeType: currentImage.type,
                    data: base64Data,
                },
            };
            
            const imagePrompt = `The user has attached an image. Please analyze it and answer any questions it contains, or fill in any information it requests, using the context from the documents provided in our chat history. The user's accompanying text is: "${currentInput || 'Please process the attached image.'}"`;
            
            messageToSend = { message: [imagePart, imagePrompt] };
        } else {
            messageToSend = { message: currentInput };
        }

        let response: GenerateContentResponse = await session.chat.sendMessage(messageToSend);
        
        if (response.functionCalls && response.functionCalls.length > 0) {
            setMessages(prev => [...prev, {role: 'system', content: 'Updating document...'}]);
            const functionCall = response.functionCalls[0];
            
            if (functionCall.name === 'correctDocumentInformation') {
                const { fileName, incorrectText, correctText } = functionCall.args;
                const docToUpdate = user.documents.find(d => d.fileName === fileName);

                if (docToUpdate) {
                    const newFullText = docToUpdate.extractedText.replace(incorrectText, correctText);
                    onUpdateDocument(docToUpdate.id, newFullText);
                    showToast(`Updated "${fileName}"!`);

                    const toolResponse = {
                        functionResponses: {
                            id: functionCall.id,
                            name: functionCall.name,
                            response: { result: "OK, the document has been updated with the correct information." },
                        }
                    };
                    response = await session.chat.sendMessage({ toolResponse });
                }
            }
        }
        setMessages(prev => [...prev, { role: 'model', content: response.text }]);

    } catch (error) {
        const errorMessage = handleApiError(error);
        setMessages(prev => [...prev, { role: 'system', content: `Error: ${errorMessage}` }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const extractedText = await extractTextFromImage(file);
      const newDocument: Document = {
        id: crypto.randomUUID(),
        fileName: file.name,
        extractedText,
        uploadDate: new Date().toISOString(),
        type: 'file',
      };
      onAddDocument(newDocument);
      showToast("Document uploaded successfully!");
    } catch (error) {
      const errorMessage = handleApiError(error);
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFormUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzingForm(true);
    setFormAnalysisError(null);
    setFormAnalysisResult(null);
    setCurrentFormAnalysisTitle(`Analyzing: ${file.name}`);
    setIsResultModalOpen(true);

    try {
      const results = await fillFormFromDocuments(file, user.documents);
      setFormAnalysisResult(results);
      const newAnalysis: FormAnalysis = {
        id: crypto.randomUUID(),
        formFileName: file.name,
        analysisDate: new Date().toISOString(),
        results: results,
      };
      onAddFormAnalysis(newAnalysis);
      setCurrentFormAnalysisTitle(`Results for: ${file.name}`);
    } catch (error) {
      const errorMessage = handleApiError(error);
      setFormAnalysisError(errorMessage);
    } finally {
      setIsAnalyzingForm(false);
      if(formInputRef.current) formInputRef.current.value = "";
    }
  };
  
  const viewSavedAnalysis = (analysis: FormAnalysis) => {
    setFormAnalysisResult(analysis.results);
    setCurrentFormAnalysisTitle(`Results for: ${analysis.formFileName}`);
    setFormAnalysisError(null);
    setIsAnalyzingForm(false);
    setIsResultModalOpen(true);
  };


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!");
  };

  const handleAddNote = () => {
    if (noteTitle.trim() && noteContent.trim()) {
        const newNote: Document = {
            id: crypto.randomUUID(),
            fileName: `${noteTitle.trim()}.txt`,
            extractedText: noteContent.trim(),
            uploadDate: new Date().toISOString(),
            type: 'note',
        };
        onAddDocument(newNote);
        showToast("Note added successfully!");
        setIsNoteModalOpen(false);
        setNoteTitle("");
        setNoteContent("");
    }
  };

  const handleImageAttach = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAttachedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openEditModal = (doc: Document) => {
    setEditingDoc(doc);
    setEditedText(doc.extractedText);
  };

  const handleSaveEditedDocument = () => {
    if (editingDoc) {
        onUpdateDocument(editingDoc.id, editedText);
        setEditingDoc(null);
        showToast("Document saved!");
    }
  };

  return (
    <>
    {/* Toast Notification */}
    {toast && (
        <div className="fixed top-5 right-5 bg-brown-600 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-slide-in">
            {toast}
        </div>
    )}
    <style>{`
        @keyframes slide-in {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out forwards; }

        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #F5EFE6; /* beige-200 */
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #A1887F; /* brown-300 */
            border-radius: 10px;
            border: 2px solid #F5EFE6; /* beige-200, creates padding effect */
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: #795548; /* brown-600 */
        }
    `}</style>
    
    {/* Document Edit Modal */}
    {editingDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40" onClick={() => setEditingDoc(null)}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 m-4 animate-slide-in" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-brown-800 mb-4">Edit: {editingDoc.fileName}</h3>
                <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="w-full h-96 p-3 border border-beige-300 rounded-md focus:ring-brown-600 focus:border-brown-600 resize-none text-sm custom-scrollbar"
                />
                <div className="flex justify-end space-x-3 mt-4">
                    <button onClick={() => setEditingDoc(null)} className="py-2 px-4 bg-beige-200 text-brown-800 rounded-lg hover:bg-beige-300 transition">Cancel</button>
                    <button onClick={handleSaveEditedDocument} className="py-2 px-4 bg-brown-600 text-white rounded-lg hover:bg-brown-800 transition">Save Changes</button>
                </div>
            </div>
        </div>
    )}

    {/* Add Note Modal */}
    {isNoteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40" onClick={() => setIsNoteModalOpen(false)}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 m-4 animate-slide-in" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-brown-800 mb-4">Add a New Note</h3>
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Note Title"
                        value={noteTitle}
                        onChange={e => setNoteTitle(e.target.value)}
                        className="w-full px-4 py-2 bg-beige-50 border border-beige-300 rounded-lg text-brown-800 focus:ring-brown-600 focus:border-brown-600 transition"
                    />
                    <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Type your note here... For example: My ABC ID is XYZ."
                        className="w-full h-48 p-3 border border-beige-300 rounded-md focus:ring-brown-600 focus:border-brown-600 resize-none text-sm custom-scrollbar"
                    />
                </div>
                <div className="flex justify-end space-x-3 mt-4">
                    <button onClick={() => setIsNoteModalOpen(false)} className="py-2 px-4 bg-beige-200 text-brown-800 rounded-lg hover:bg-beige-300 transition">Cancel</button>
                    <button onClick={handleAddNote} className="py-2 px-4 bg-brown-600 text-white rounded-lg hover:bg-brown-800 transition disabled:bg-brown-300" disabled={!noteTitle.trim() || !noteContent.trim()}>Add Note</button>
                </div>
            </div>
        </div>
    )}

    {/* Form Analysis Result Modal */}
    {isResultModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={() => setIsResultModalOpen(false)}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 m-4 animate-slide-in flex flex-col" onClick={e => e.stopPropagation()} style={{maxHeight: '90vh'}}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-brown-800">{currentFormAnalysisTitle}</h3>
                    <button onClick={() => setIsResultModalOpen(false)} className="text-brown-400 hover:text-brown-800">
                        <XIcon className="h-6 w-6"/>
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                    {isAnalyzingForm && (
                        <div className="flex flex-col items-center justify-center h-64">
                             <div className="flex items-center space-x-2">
                                <span className="h-3 w-3 bg-brown-600 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                <span className="h-3 w-3 bg-brown-600 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                <span className="h-3 w-3 bg-brown-600 rounded-full animate-pulse"></span>
                            </div>
                            <p className="text-brown-600 mt-4">Analyzing form, please wait...</p>
                        </div>
                    )}
                    {formAnalysisError && (
                        <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-lg">
                            <p className="font-bold">Analysis Failed</p>
                            <p>{formAnalysisError}</p>
                        </div>
                    )}
                    {formAnalysisResult && (
                         <table className="w-full text-sm text-left text-brown-800">
                            <thead className="text-xs text-brown-600 uppercase bg-beige-200">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Form Field</th>
                                    <th scope="col" className="px-6 py-3">Suggested Value</th>
                                    <th scope="col" className="px-6 py-3">Source</th>
                                    <th scope="col" className="px-6 py-3"><span className="sr-only">Copy</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {formAnalysisResult.map((result, index) => (
                                    <tr key={index} className="bg-white border-b border-beige-200 hover:bg-beige-50">
                                        <td className="px-6 py-4 font-medium">{result.fieldName}</td>
                                        <td className="px-6 py-4">{result.suggestedValue}</td>
                                        <td className="px-6 py-4 text-xs text-brown-400">{result.sourceDocument}</td>
                                        <td className="px-6 py-4">
                                            {result.suggestedValue !== "Information not found" && (
                                                <button onClick={() => copyToClipboard(result.suggestedValue)} className="text-brown-400 hover:text-brown-800">
                                                    <CopyIcon className="h-5 w-5"/>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <div className="flex justify-end mt-6">
                    <button onClick={() => setIsResultModalOpen(false)} className="py-2 px-6 bg-brown-600 text-white rounded-lg hover:bg-brown-800 transition">Close</button>
                </div>
            </div>
        </div>
    )}


    <div className="relative flex h-screen w-full bg-beige-50 font-sans text-brown-900 overflow-hidden">
      {/* Sidebar backdrop for mobile */}
      {isSidebarOpen && (
          <div
              className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
          ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-30 w-4/5 max-w-sm md:w-[300px] lg:w-[350px] bg-beige-100 p-6 flex flex-col border-r border-beige-200 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-brown-800">DocuMind</h1>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-brown-400 hover:text-brown-800">
                <XIcon className="h-6 w-6"/>
            </button>
        </div>
        
        <h2 className="text-lg font-semibold text-brown-800 mb-4">Actions</h2>
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/png, image/jpeg, image/webp" className="hidden" />
        <input type="file" ref={formInputRef} onChange={handleFormUpload} accept="image/png, image/jpeg, image/webp" className="hidden" />
        <div className="space-y-2 mb-4">
            <button onClick={() => fileInputRef.current?.click()} disabled={isUploading || isAnalyzingForm} className="w-full bg-brown-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-brown-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-600 transition disabled:bg-brown-300 disabled:cursor-not-allowed">
                {isUploading ? 'Uploading...' : 'Upload File'}
            </button>
            <button onClick={() => setIsNoteModalOpen(true)} disabled={isUploading || isAnalyzingForm} className="w-full bg-beige-200 text-brown-800 font-bold py-2.5 px-4 rounded-lg hover:bg-beige-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
                Add Note
            </button>
            <button onClick={() => formInputRef.current?.click()} disabled={isUploading || isAnalyzingForm} className="w-full bg-beige-300 text-brown-800 font-bold py-2.5 px-4 rounded-lg hover:bg-brown-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-600 transition disabled:bg-beige-200 disabled:text-brown-400 disabled:cursor-not-allowed">
                {isAnalyzingForm ? 'Analyzing...' : 'Form Fillup'}
            </button>
        </div>
        {uploadError && <p className="text-red-500 text-xs text-center mb-2">{uploadError}</p>}

        <div className="flex-grow flex flex-col overflow-hidden">
            <h2 className="text-lg font-semibold text-brown-800 mb-4 pt-2 border-t border-beige-300">Your Knowledge Base</h2>
            <div className="flex-grow overflow-y-auto space-y-2 pr-2 -mr-2 custom-scrollbar">
                {user.documents.length === 0 && <p className="text-center text-sm text-brown-300 mt-8">Upload a file or add a note to get started.</p>}
                {user.documents.map(doc => (
                    <div key={doc.id} className="group flex items-center justify-between bg-white p-3 rounded-lg hover:bg-beige-200 transition cursor-pointer">
                        <div className="flex items-center space-x-3 overflow-hidden" onClick={() => openEditModal(doc)}>
                            {doc.type === 'file' ? <DocumentIcon className="h-5 w-5 text-brown-300 flex-shrink-0" /> : <NoteIcon className="h-5 w-5 text-brown-300 flex-shrink-0" />}
                            <span className="text-sm font-medium truncate">{doc.fileName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button onClick={() => openEditModal(doc)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <EditIcon className="h-5 w-5 text-brown-400 hover:text-brown-600"/>
                            </button>
                            <button onClick={() => onDeleteDocument(doc.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <TrashIcon className="h-5 w-5 text-red-400 hover:text-red-600"/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <h2 className="text-lg font-semibold text-brown-800 mb-4 pt-4 mt-2 border-t border-beige-300">Saved Form Analyses</h2>
            <div className="flex-grow overflow-y-auto space-y-2 pr-2 -mr-2 custom-scrollbar">
                {(user.formAnalyses ?? []).length === 0 && <p className="text-center text-sm text-brown-300 mt-4">Your recent form analyses will appear here.</p>}
                {(user.formAnalyses ?? []).map(analysis => (
                    <div key={analysis.id} className="group flex items-center justify-between bg-white p-3 rounded-lg hover:bg-beige-200 transition cursor-pointer">
                        <div className="flex items-center space-x-3 overflow-hidden" onClick={() => viewSavedAnalysis(analysis)}>
                            <AnalysisIcon className="h-5 w-5 text-brown-300 flex-shrink-0" />
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium truncate">{analysis.formFileName}</p>
                                <p className="text-xs text-brown-400 truncate">{new Date(analysis.analysisDate).toLocaleString()}</p>
                            </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteFormAnalysis(analysis.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                            <TrashIcon className="h-5 w-5 text-red-400 hover:text-red-600"/>
                        </button>
                    </div>
                ))}
            </div>
        </div>
        
        <div className="border-t border-beige-300 mt-4 pt-4">
            <p className="text-sm text-brown-600 mb-2 truncate">Welcome, <span className="font-bold">{user.username}</span>!</p>
            <button onClick={onLogout} className="text-sm text-brown-300 hover:text-brown-800 transition w-full text-left">Logout</button>
            <p className="text-xs text-brown-300 mt-4 text-right">by ~Swaraj</p>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-beige-200 bg-white">
            <button onClick={() => setIsSidebarOpen(true)} className="text-brown-600 hover:text-brown-900">
                <MenuIcon className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-brown-800">DocuMind</h1>
            <div className="w-6"></div>
        </header>

        <main className="flex-grow p-4 sm:p-6 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-3 sm:gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'model' && <div className="h-8 w-8 rounded-full bg-brown-600 flex-shrink-0 items-center justify-center flex font-bold text-white text-xs">AI</div>}
                  <div className={`max-w-lg sm:max-w-xl p-3 sm:p-4 rounded-2xl shadow-sm ${
                      msg.role === 'user' ? 'bg-brown-600 text-white rounded-br-none' :
                      msg.role === 'model' ? 'bg-beige-200 text-brown-900 rounded-bl-none' :
                      'bg-yellow-100 text-yellow-800 border border-yellow-200 text-xs'
                  }`}>
                    {msg.image && <img src={msg.image} alt="User attachment" className="mb-2 rounded-lg max-w-xs" />}
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
              </div>
            ))}
             {isLoading && (
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="h-8 w-8 rounded-full bg-brown-600 flex-shrink-0 items-center justify-center flex font-bold text-white text-xs">AI</div>
                <div className="max-w-lg p-4 rounded-2xl bg-beige-200 text-brown-900 rounded-bl-none shadow-sm">
                  <div className="flex items-center space-x-2">
                      <span className="h-2 w-2 bg-brown-300 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                      <span className="h-2 w-2 bg-brown-300 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                      <span className="h-2 w-2 bg-brown-300 rounded-full animate-pulse"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        <div className="p-4 sm:p-6 bg-beige-100 border-t border-beige-200">
          <div className="max-w-4xl mx-auto">
            {imagePreview && (
                <div className="relative w-24 h-24 mb-2">
                    <img src={imagePreview} alt="upload preview" className="w-full h-full object-cover rounded-md"/>
                    <button onClick={removeAttachedImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md">
                        <XIcon className="h-4 w-4"/>
                    </button>
                </div>
            )}
            <div className="flex items-center space-x-2 sm:space-x-4">
                <input type="file" ref={imageInputRef} onChange={handleImageAttach} accept="image/*" className="hidden" />
                <button onClick={() => imageInputRef.current?.click()} className="p-3 text-brown-600 hover:text-brown-800 bg-white border border-beige-300 rounded-full transition">
                    <PaperclipIcon className="h-6 w-6" />
                </button>
                <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask a question or attach an image..."
                className="w-full px-4 py-3 bg-white border border-beige-300 rounded-lg text-brown-800 focus:ring-brown-600 focus:border-brown-600 transition"
                />
                <button onClick={handleSendMessage} disabled={isLoading || (!input.trim() && !attachedImage)} className="bg-brown-600 text-white p-3 rounded-full hover:bg-brown-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-600 transition disabled:bg-brown-300 disabled:cursor-not-allowed flex-shrink-0">
                <SendIcon className="h-6 w-6" />
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};