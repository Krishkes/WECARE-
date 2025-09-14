
import { useState, useEffect, useRef,useCallback } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Bell,
  Clock,
  Users,
  Menu as MenuIcon,
  Star,
  Plus,
  Edit,
  Trash,
  Pill,
  HeartPulse,
  Droplets,
  Moon,
  Activity,
  Lightbulb,
  UserPlus,
  MessageSquare,
  Video as VideoIcon,
  X,
  Send,
  Bot,
  User,
} from "lucide-react";
import { Input } from "./ui/input";
import Menu from "./Menu";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff } from 'lucide-react';
// Voice Assistant Hook - Add this right after your imports
const useVoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState('');
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const startListening = () => {
    setIsListening(true);
    SpeechRecognition.startListening({ continuous: true });
    setVoiceFeedback("I'm listening... How can I help you?");
  };

  const stopListening = useCallback(() => {
    setIsListening(false);
    SpeechRecognition.stopListening();
    setVoiceFeedback("");
    resetTranscript();
  }, [resetTranscript]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return {
      isListening: false,
      voiceFeedback: "Your browser doesn't support speech recognition.",
      toggleListening: () => {},
      transcript: '',
      browserSupported: false,
      setVoiceFeedback: () => {}
    };
  }

  return {
    isListening,
    voiceFeedback,
    toggleListening,
    transcript,
    browserSupported: true, 
    setVoiceFeedback
  };
};

// Voice Command Processor - Add this right after the hook
const processVoiceCommand = (transcript, appState, ) => {
  const command = transcript.toLowerCase().trim();
  
  // Emergency commands
  if (command.includes('emergency') || command.includes('help') || command.includes('alert')) {
    return { action: 'TRIGGER_EMERGENCY', feedback: 'Emergency alert activated!' };
  }
  
  // Menu commands
  if ((command.includes('open menu') || command.includes('show menu')) && !appState.isMenuOpen) {
    return { action: 'OPEN_MENU', feedback: 'Opening menu' };
  }
  
  if ((command.includes('close menu') || command.includes('hide menu')) && appState.isMenuOpen) {
    return { action: 'CLOSE_MENU', feedback: 'Closing menu' };
  }
  
  // Chatbot commands
  if ((command.includes('open chat') || command.includes('chatbot') || command.includes('assistant')) && !appState.isChatbotOpen) {
    return { action: 'OPEN_CHATBOT', feedback: 'Opening health assistant' };
  }
  
  if ((command.includes('close chat') || command.includes('close assistant')) && appState.isChatbotOpen) {
    return { action: 'CLOSE_CHATBOT', feedback: 'Closing chat' };
  }
  
  // Medicine commands
  if (command.includes('add medicine') || command.includes('new medicine')) {
    return { action: 'ADD_MEDICINE', feedback: 'What medicine would you like to add?' };
  }
  
  // Process medicine name input
  if (appState.expectingMedicineInput && command.length > 3) {
    return { 
      action: 'SET_MEDICINE_NAME', 
      feedback: `Medicine name set to: ${command}. Now say the time for this medicine.`,
      data: command 
    };
  }
  
  // Process medicine time input
  if (appState.expectingMedicineTime && command.length > 3) {
    return { 
      action: 'SET_MEDICINE_TIME', 
      feedback: `Medicine time set to: ${command}. Adding reminder now.`,
      data: command 
    };
  }
  
  if (command.includes('medicine reminder') || command.includes('my medicines')) {
    return { action: 'SHOW_MEDICINES', feedback: 'Showing your medicine reminders' };
  }
  
  // Other commands...
  // ... (keep the rest of your commands as they are)
  
  return { 
    action: 'UNKNOWN', 
    feedback: `I heard: "${command}". Sorry, I didn't understand that. Try saying things like "emergency", "open menu", or "add medicine".`
  };
};
// Chatbot Component
function ChatbotModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI health assistant. How are you feeling today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response after a short delay
    setTimeout(() => {
      generateAIResponse(inputMessage);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userMessage) => {
    const lowerCaseMessage = userMessage.toLowerCase();
    let response = "";
    let emergencyAlert = false;

    // Enhanced training data with priority levels
    const trainingData = [
      // EMERGENCY conditions (red flags)
      {
        patterns: ["chest pain", "heart attack", "can't breathe", "difficulty breathing", "shortness of breath"],
        response: "🚨 This could be a medical emergency! Chest pain and breathing difficulties require immediate attention. Please call emergency services or go to the nearest hospital immediately.",
        priority: "emergency"
      },
      {
        patterns: ["severe headache", "worst headache", "thunderclap headache", "headache with vision loss"],
        response: "🚨 Severe sudden headaches can indicate serious conditions. Please seek emergency medical care immediately.",
        priority: "emergency"
      },
      {
        patterns: ["unconscious", "passed out", "fainted", "seizure", "convulsion"],
        response: "🚨 This requires immediate emergency care! Call for help and ensure the person is in a safe position.",
        priority: "emergency"
      },

      // URGENT conditions (yellow flags)
      {
        patterns: ["high fever", "fever over 103", "104 fever", "105 fever"],
        response: "⚠️ High fever requires medical attention. Please contact a healthcare provider today or visit urgent care. Try cool compresses and stay hydrated while seeking care.",
        priority: "urgent"
      },
      {
        patterns: ["severe pain", "unbearable pain", "worst pain of my life"],
        response: "⚠️ Severe pain should be evaluated by a medical professional. Please contact your doctor or visit urgent care today.",
        priority: "urgent"
      },

      // COMMON symptoms with detailed advice
      {
        patterns: ["headache", "head ache", "migraine"],
        response: "For headaches: 1) Rest in quiet, dark room 2) Cold compress on forehead 3) Stay hydrated 4) Gentle neck stretches 5) OTC pain relievers if approved by your doctor. If headache persists >24 hours or worsens, consult healthcare provider.",
        priority: "common"
      },
      {
        patterns: ["fever", "temperature", "hot", "chills"],
        response: "For fever: 1) Rest and hydrate with water, broth, or electrolyte drinks 2) Lukewarm sponge bath 3) Light clothing 4) OTC fever reducers as directed 5) Monitor temperature every 4 hours. If fever >102°F or lasts >3 days, see doctor.",
        priority: "common"
      },
      {
        patterns: ["cough", "coughing", "chest cough", "dry cough"],
        response: "For cough: 1) Warm fluids like tea with honey 2) Steam inhalation 3) Humidifier in room 4) OTC cough suppressants if needed 5) Prop up with extra pillows at night. If coughing up blood or difficulty breathing, seek urgent care.",
        priority: "common"
      },
      {
        patterns: ["sore throat", "throat pain", "swallowed glass"],
        response: "For sore throat: 1) Warm salt water gargle 2) Honey and lemon tea 3) Throat lozenges 4) Stay hydrated 5) Rest your voice. If severe pain, difficulty swallowing, or lasts >1 week, see doctor.",
        priority: "common"
      },

      // PREVENTIVE care and general wellness
      {
        patterns: ["stress", "anxious", "anxiety", "worry", "nervous"],
        response: "For stress: 1) Deep breathing (4-7-8 technique) 2) 5-minute meditation 3) Short walk outdoors 4) Limit caffeine 5) Ensure 7-8 hours sleep. Consider speaking with a mental health professional for ongoing support.",
        priority: "wellness"
      },
      {
        patterns: ["can't sleep", "insomnia", "sleepless", "trouble sleeping"],
        response: "For sleep issues: 1) Consistent sleep schedule 2) Dark, cool bedroom 3) No screens 1 hour before bed 4) Avoid caffeine after noon 5) Relaxing bedtime routine. If persistent, discuss with your doctor.",
        priority: "wellness"
      },
      {
        patterns: ["hello", "hi", "hey", "greetings"],
        response: "Hello! I'm your AI health assistant. I can provide general wellness advice and first aid information. Please describe how you're feeling or what symptoms you're experiencing.",
        priority: "greeting"
      },
      {
        patterns: ["thank", "thanks", "appreciate"],
        response: "You're welcome! Remember, I'm here to provide general information only. For proper medical advice, always consult with a healthcare professional. Is there anything else I can help with?",
        priority: "courtesy"
      }
    ];

    // Find ALL matching patterns (not just one)
    const matches = [];
    
    trainingData.forEach(item => {
      item.patterns.forEach(pattern => {
        if (lowerCaseMessage.includes(pattern)) {
          matches.push({...item, matchedPattern: pattern});
        }
      });
    });

    // Prioritize responses: emergency > urgent > common > wellness
    const emergencyMatch = matches.find(m => m.priority === "emergency");
    const urgentMatch = matches.find(m => m.priority === "urgent");
    const commonMatch = matches.find(m => m.priority === "common");
    const wellnessMatch = matches.find(m => m.priority === "wellness");

    if (emergencyMatch) {
      response = emergencyMatch.response;
      emergencyAlert = true;
    } else if (urgentMatch) {
      response = urgentMatch.response;
    } else if (commonMatch) {
      response = commonMatch.response;
    } else if (wellnessMatch) {
      response = wellnessMatch.response;
    } else if (matches.length > 0) {
      response = matches[0].response;
    } else {
      response = "I understand you're seeking health information. While I can offer general wellness tips, please remember I'm an AI assistant and not a substitute for professional medical care. For accurate diagnosis and treatment, please consult a healthcare provider. Could you describe your symptoms in more detail?";
    }

    // Add disclaimer to all responses
    response += "\n\n⚠️ Disclaimer: This is general information only, not medical advice. Consult a healthcare professional for proper diagnosis and treatment.";

    const botMessage = {
      id: messages.length + 2,
      text: response,
      sender: "bot",
      timestamp: new Date(),
      isEmergency: emergencyAlert
    };

    setMessages(prev => [...prev, botMessage]);
    
    // Trigger emergency alert if needed
    if (emergencyAlert) {
      setTimeout(() => {
        alert("🚨 EMERGENCY ALERT: Please seek immediate medical attention!");
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md h-[600px] flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white p-5 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">AI Health Assistant</h3>
              <p className="text-white/80 text-sm">Here to help with your health concerns</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 h-10 w-10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-gray-100">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex mb-4 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.sender === "bot" && (
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center mr-3">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              )}
              <div
                className={`max-w-xs p-4 rounded-2xl ${
                  message.sender === "user"
                    ? "bg-emerald-600 text-white rounded-br-none shadow-md"
                    : message.isEmergency
                    ? "bg-red-100 border-2 border-red-500 text-red-900 rounded-bl-none shadow-md"
                    : "bg-white border border-gray-200 rounded-bl-none shadow-sm"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <p className={`text-xs mt-2 ${message.sender === "user" ? "text-emerald-100" : message.isEmergency ? "text-red-700" : "text-gray-500"}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {message.sender === "user" && (
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-400 rounded-full flex items-center justify-center ml-3">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center mr-3">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-4 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Describe how you're feeling..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 rounded-xl border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 text-sm py-3"
            />
            <Button
              onClick={handleSendMessage}
              disabled={inputMessage.trim() === ""}
              className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl px-4 py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Type your symptoms or health questions above
          </p>
        </div>
      </div>
    </div>
  );
}

function Homepage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [medicineReminders, setMedicineReminders] = useState([
    { id: 1, name: 'Morning Pill', time: '8:00 AM', isEditing: false },
    { id: 2, name: 'Noon Tablet', time: '12:00 PM', isEditing: false },
    { id: 3, name: 'Evening Capsule', time: '6:00 PM', isEditing: false },
  ]);
  const [newReminderName, setNewReminderName] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('');
  const [pulse, setPulse] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [expectingMedicineInput, setExpectingMedicineInput] = useState(false);
  const [expectingMedicineTime, setExpectingMedicineTime] = useState(false);
  const [pendingMedicineName, setPendingMedicineName] = useState('');

  // useVoiceAssistant hook
  const {
    isListening,
    voiceFeedback,
    toggleListening,
    transcript,
    browserSupported,
    setVoiceFeedback
  } = useVoiceAssistant();

  // Pulse interval useEffect
  useEffect(() => {
    const interval = setInterval(() => {
      // Optional: Add pulse animation if needed
    }, 1500);
    return () => clearInterval(interval);
  }, [pulse]);

  // Command deduplication useEffect - Process commands directly here
  const lastProcessedCommand = useRef('');
  useEffect(() => {
    if (transcript && isListening && transcript !== lastProcessedCommand.current) {
      lastProcessedCommand.current = transcript;
      
      // Process the command directly instead of using handleVoiceCommand
      const result = processVoiceCommand(transcript, {
        isMenuOpen,
        isChatbotOpen,
        medicineReminders,
        expectingMedicineInput,
        expectingMedicineTime
      });
      
      // Handle different commands
      switch(result.action) {
        case 'TRIGGER_EMERGENCY':
          alert('Emergency alert sent to caregivers!');
          break;
        case 'OPEN_MENU':
          setIsMenuOpen(true);
          break;
        case 'CLOSE_MENU':
          setIsMenuOpen(false);
          break;
        case 'OPEN_CHATBOT':
          setIsChatbotOpen(true);
          break;
        case 'CLOSE_CHATBOT':
          setIsChatbotOpen(false);
          break;
        case 'ADD_MEDICINE':
          setExpectingMedicineInput(true);
          setVoiceFeedback(result.feedback);
          break;
        case 'SET_MEDICINE_NAME':
          setPendingMedicineName(result.data);
          setExpectingMedicineInput(false);
          setExpectingMedicineTime(true);
          setVoiceFeedback(result.feedback);
          break;
        case 'SET_MEDICINE_TIME':
          if (pendingMedicineName) {
            const newReminder = {
              id: Date.now(),
              name: pendingMedicineName,
              time: result.data,
              isEditing: false,
            };
            setMedicineReminders([...medicineReminders, newReminder]);
            setVoiceFeedback(result.feedback);
            setPendingMedicineName('');
            setExpectingMedicineTime(false);
            
            // Show success message
            setTimeout(() => {
              setVoiceFeedback(`Added ${pendingMedicineName} at ${result.data}`);
            }, 1000);
          }
          break;
        case 'STOP_LISTENING':
          toggleListening();
          break;
        default:
          console.log('Command:', result.action);
      }
      
      // Clear the last processed command after 3 seconds
      const timer = setTimeout(() => {
        lastProcessedCommand.current = '';
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [transcript, isListening, isMenuOpen, isChatbotOpen, medicineReminders, 
      expectingMedicineInput, expectingMedicineTime, toggleListening, pendingMedicineName]);

  // Rest of your component functions
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const openChatbot = () => setIsChatbotOpen(true);
  const closeChatbot = () => setIsChatbotOpen(false);
  
  const addMedicineReminder = () => {
    if (newReminderName && newReminderTime) {
      const newReminder = {
        id: Date.now(),
        name: newReminderName,
        time: newReminderTime,
        isEditing: false,
      };
      setMedicineReminders([...medicineReminders, newReminder]);
      setNewReminderName('');
      setNewReminderTime('');
      
      // Show success message
      setVoiceFeedback(`Added ${newReminderName} at ${newReminderTime}`);
      setTimeout(() => setVoiceFeedback(''), 3000);
    } else {
      alert('Please enter both medicine name and time.');
    }
  };

  const startEditReminder = (id) => {
    setMedicineReminders(medicineReminders.map(reminder =>
      reminder.id === id ? { ...reminder, isEditing: true } : reminder
    ));
  };

  const handleReminderNameChange = (id, newName) => {
    setMedicineReminders(medicineReminders.map(reminder =>
      reminder.id === id ? { ...reminder, name: newName } : reminder
    ));
  };

  const handleReminderTimeChange = (id, newTime) => {
    setMedicineReminders(medicineReminders.map(reminder =>
      reminder.id === id ? { ...reminder, time: newTime } : reminder
    ));
  };

  const saveEditReminder = (id) => {
    setMedicineReminders(medicineReminders.map(reminder =>
      reminder.id === id ? { ...reminder, isEditing: false } : reminder
    ));
  };

  const deleteReminder = (id) => {
    const reminderToDelete = medicineReminders.find(r => r.id === id);
    setMedicineReminders(medicineReminders.filter(reminder => reminder.id !== id));
    
    // Show deletion message
    setVoiceFeedback(`Deleted ${reminderToDelete.name}`);
    setTimeout(() => setVoiceFeedback(''), 3000);
  };

  const healthMetrics = {
    heartRate: { value: 72, trend: 'up', unit: 'bpm' },
    bloodPressure: { value: '118/76', trend: 'down', unit: 'mmHg' },
    sleepQuality: { value: '8.2', trend: 'up', unit: 'hrs' },
    activityLevel: { value: '87%', trend: 'steady', unit: 'goal' },
  };

  const wellnessTips = [
    { id: 1, tip: 'Drink warm water with lemon to boost metabolism.' },
    { id: 2, tip: 'Practice 5-minute mindfulness breathing daily.' },
    { id: 3, tip: 'Walk 10k steps for better cardiovascular health.' },
  ];

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-emerald-50 to-green-50 min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-emerald-200/40"
            style={{
              width: `${Math.random() * 400 + 100}px`,
              height: `${Math.random() * 400 + 100}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              filter: 'blur(60px)',
            }}
          />
        ))}
      </div>

      {/* Voice input indicators */}
      {expectingMedicineInput && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded-lg z-50 flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
          <p>Listening for medicine name...</p>
        </div>
      )}

      {expectingMedicineTime && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded-lg z-50 flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
          <p>Listening for medicine time...</p>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-gradient-to-r from-emerald-600 to-green-700 p-5 rounded-2xl shadow-md z-10 relative">
        <h1 className="text-3xl font-bold tracking-tight flex items-center text-white">
          <HeartPulse className="inline-block mr-3 h-8 w-8 text-white" />
          Wecare Dashboard
        </h1>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            className="border-white/30 text-white hover:bg-white/20 hover:text-white transition-all duration-300 flex items-center shadow-sm"
            onClick={toggleMenu}
          >
            <MenuIcon className="mr-2 h-5 w-5" />
            <span className="text-white">Menu</span>
          </Button>
          
          {/* Voice Control Button */}
          <Button
            onClick={toggleListening}
            className={`rounded-full h-12 w-12 p-0 ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse ring-2 ring-red-300' 
                : 'bg-blue-500 hover:bg-blue-600'
            } transition-all duration-300 shadow-md`}
            title={isListening ? 'Stop listening' : 'Start voice control'}
          >
            {isListening ? (
              <MicOff className="h-6 w-6 text-white" />
            ) : (
              <Mic className="h-6 w-6 text-white" />
            )}
          </Button>
        </div>
      </div>

      {/* Voice Feedback Display */}
      {voiceFeedback && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg z-50 flex items-center max-w-md">
          <div className={`w-3 h-3 rounded-full mr-2 animate-pulse ${isListening ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="truncate">{voiceFeedback}</span>
        </div>
      )}

      {/* Browser Support Warning */}
      {!browserSupported && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded-lg z-10 relative" role="alert">
          <p className="font-medium">Voice commands not supported</p>
          <p className="text-sm">Your browser doesn't support voice recognition. Please use Chrome or Edge for voice commands.</p>
        </div>
      )}

      {/* Emergency Button */}
      <div className="flex justify-center mb-8 z-10 relative">
        <Button
          onClick={() => {
            alert('Emergency alert sent to caregivers!');
            setVoiceFeedback('Emergency alert activated!');
            setTimeout(() => setVoiceFeedback(''), 3000);
          }}
          className={`bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center ${pulse ? 'animate-pulse' : ''}`}
        >
          <Bell className="mr-3 w-6 h-6" /> Emergency Alert
        </Button>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-10 relative">
        {/* AI Health Assistant Card */}
        <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden border border-emerald-100">
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-700 text-white p-5">
            <CardTitle className="flex items-center font-semibold text-lg tracking-wider">
              <Bot className="mr-3 h-5 w-5 text-white" /> AI Health Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8 text-emerald-600" />
              </div>
              <p className="text-gray-700 mb-4">
                Chat with our AI assistant for health advice, symptom checking, and wellness tips.
              </p>
              <Button 
                onClick={openChatbot} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl transition-all duration-200 hover:scale-105 shadow-md"
              >
                Open Chat
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Medicine Reminders Card */}
        <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden border border-emerald-100">
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-700 text-white p-5">
            <CardTitle className="flex items-center font-semibold text-lg tracking-wider">
              <Pill className="mr-3 h-5 w-5 text-white" /> Medicine Reminders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {medicineReminders.map((reminder) => (
              <div 
                key={reminder.id} 
                className="flex justify-between items-center bg-emerald-50/80 p-3 rounded-lg border border-emerald-100 hover:border-emerald-200 transition-all duration-200"
              >
                {reminder.isEditing ? (
                  <div className="flex-grow space-y-2">
                    <Input
                      type="text"
                      value={reminder.name}
                      onChange={(e) => handleReminderNameChange(reminder.id, e.target.value)}
                      placeholder="Medicine Name"
                      className="w-full rounded-lg border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                    />
                    <Input
                      type="text"
                      value={reminder.time}
                      onChange={(e) => handleReminderTimeChange(reminder.id, e.target.value)}
                      placeholder="Time (e.g., 8:00 AM)"
                      className="w-full rounded-lg border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Clock className="mr-3 h-4 w-4 text-emerald-600" />
                    <div>
                      <p className="text-md font-medium text-gray-800">{reminder.name}</p>
                      <p className="text-gray-600 text-sm">{reminder.time}</p>
                    </div>
                  </div>
                )}
                <div className="flex space-x-1">
                  {reminder.isEditing ? (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-emerald-600 hover:bg-emerald-100 rounded-lg"
                      onClick={() => saveEditReminder(reminder.id)}
                    >
                      Save
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-blue-500 hover:bg-blue-50 rounded-lg"
                      onClick={() => startEditReminder(reminder.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-500 hover:bg-red-50 rounded-lg"
                    onClick={() => deleteReminder(reminder.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Medicine Name"
                  value={newReminderName}
                  onChange={(e) => setNewReminderName(e.target.value)}
                  className="flex-1 rounded-lg border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                />
                <Input
                  type="text"
                  placeholder="Time"
                  value={newReminderTime}
                  onChange={(e) => setNewReminderTime(e.target.value)}
                  className="w-28 rounded-lg border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                />
              </div>
              <Button 
                onClick={addMedicineReminder} 
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 transition-all duration-300 rounded-lg flex items-center justify-center shadow-md"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Reminder
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Health Tracking Card */}
        <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden border border-emerald-100">
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-700 text-white p-5">
            <CardTitle className="flex items-center font-semibold text-lg tracking-wider">
              <HeartPulse className="mr-3 h-5 w-5 text-white" /> Health Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-2 gap-4">
            {Object.entries(healthMetrics).map(([key, metric]) => (
              <div 
                key={key} 
                className="bg-emerald-50/80 p-4 rounded-lg border border-emerald-100 hover:border-emerald-200 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {key === 'heartRate' && <HeartPulse className="mr-2 h-5 w-5 text-red-500" />}
                    {key === 'bloodPressure' && <Droplets className="mr-2 h-5 w-5 text-blue-500" />}
                    {key === 'sleepQuality' && <Moon className="mr-2 h-5 w-5 text-indigo-500" />}
                    {key === 'activityLevel' && <Activity className="mr-2 h-5 w-5 text-emerald-500" />}
                    <span className="text-sm font-medium text-gray-800 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    metric.trend === 'up' ? 'bg-green-100 text-green-800' :
                    metric.trend === 'down' ? 'bg-red-100 text-red-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.value} <span className="text-sm font-normal text-gray-600">{metric.unit}</span>
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Wellness Tips Card */}
        <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden border border-emerald-100">
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-700 text-white p-5">
            <CardTitle className="flex items-center font-semibold text-lg tracking-wider">
              <Lightbulb className="mr-3 h-5 w-5 text-white" /> Wellness Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {wellnessTips.map((tip) => (
              <div 
                key={tip.id} 
                className="group bg-emerald-50/80 p-4 rounded-lg border border-emerald-100 hover:border-emerald-200 transition-all duration-200 flex items-start"
              >
                <Star className="mt-0.5 mr-3 h-4 w-4 text-amber-400" />
                <p className="text-sm text-gray-800 group-hover:text-gray-900 transition-colors duration-200">
                  {tip.tip}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Social Engagement Card */}
        <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden border border-emerald-100">
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-700 text-white p-5">
            <CardTitle className="flex items-center font-semibold text-lg tracking-wider">
              <Users className="mr-3 h-5 w-5 text-white" /> Social Engagement
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {[
              { icon: <UserPlus className="h-5 w-5 text-emerald-600" />, text: "Connect with Family", action: "Invite" },
              { icon: <MessageSquare className="h-5 w-5 text-emerald-600" />, text: "Send Messages", action: "Message" },
              { icon: <VideoIcon className="h-5 w-5 text-emerald-600" />, text: "Video Calls", action: "Call" },
            ].map((item, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between bg-white p-3 rounded-lg border border-emerald-100 hover:border-emerald-200 transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                    {item.icon}
                  </div>
                  <p className="text-sm font-medium text-gray-800">{item.text}</p>
                </div>
                <Button 
                  variant="default" 
                  size="sm"
                  className="bg-emerald-600 text-white hover:bg-emerald-700 transition-colors duration-200"
                >
                  {item.action}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Menu isOpen={isMenuOpen} onClose={closeMenu} />
      <ChatbotModal isOpen={isChatbotOpen} onClose={closeChatbot} />
    </div>
  );
}

export default Homepage;