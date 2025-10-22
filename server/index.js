const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const { create } = require('ipfs-http-client');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('../'));

// IPFS Configuration
const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https'
});

// AI Persona Generation Endpoint
app.post('/api/generate-persona', async (req, res) => {
  try {
    const { prompt, personaType, walletAddress } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Generate persona using Deepseek API
    const aiResponse = await generatePersonaWithAI(prompt, personaType);
    
    // Generate image (placeholder - integrate with Freepik/DALL-E)
    const imageUrl = await generatePersonaImage(aiResponse.name, personaType);
    
    // Upload to IPFS
    const metadata = {
      name: aiResponse.name,
      description: aiResponse.description,
      image: imageUrl,
      attributes: [
        { trait_type: "Category", value: personaType },
        { trait_type: "Specialty", value: aiResponse.specialty },
        { trait_type: "Creator", value: walletAddress }
      ]
    };
    
    const ipfsResult = await ipfs.add(JSON.stringify(metadata));
    const ipfsUrl = `https://ipfs.io/ipfs/${ipfsResult.cid}`;

    res.json({
      persona: aiResponse,
      imageUrl: imageUrl,
      ipfsUrl: ipfsUrl,
      metadata: metadata
    });

  } catch (error) {
    console.error('Persona generation error:', error);
    res.status(500).json({ error: 'Failed to generate persona' });
  }
});

// AI Generation Function
async function generatePersonaWithAI(prompt, personaType) {
  const enhancedPrompt = `Create a detailed AI persona with this description: ${prompt}. 
  Persona type: ${personaType}. 
  Return JSON with: name, description, specialty, and signature phrases.`;

  try {
    // Using Deepseek API
    const response = await axios.post(process.env.DEEPSEEK_URL, {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are a creative AI persona generator. Always return valid JSON.'
        },
        {
          role: 'user', 
          content: enhancedPrompt
        }
      ],
      max_tokens: 500,
      temperature: 0.8
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const aiContent = response.data.choices[0].message.content;
    
    // Extract JSON from AI response
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      // Fallback if no JSON found
      return {
        name: prompt.split(' ').slice(0, 2).join(' '),
        description: `A ${personaType} persona: ${prompt}`,
        specialty: personaType,
        signature_phrases: ["Hello! I'm your new AI persona!"]
      };
    }

  } catch (error) {
    console.error('AI API Error:', error);
    // Fallback response
    return {
      name: `Generated ${personaType}`,
      description: `Custom ${personaType} persona: ${prompt}`,
      specialty: personaType,
      signature_phrases: ["Ready to create amazing content!"]
    };
  }
}

// Image Generation (Placeholder - integrate with actual service)
async function generatePersonaImage(name, personaType) {
  // For now, return placeholder image
  // Integrate with Freepik/DALL-E/Stable Diffusion here
  return '/assets/placeholder-persona.jpg';
}

// Get User's Personas
app.get('/api/personas/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    // In production, fetch from blockchain
    // For now, return mock data
    const mockPersonas = [
      {
        id: 1,
        name: "Demo Persona",
        type: "creative",
        image: "/assets/placeholder.jpg",
        minted: new Date().toISOString()
      }
    ];
    
    res.json(mockPersonas);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch personas' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Rivalisme Universe Server running on port ${PORT}`);
  console.log(`📍 API available at: http://localhost:${PORT}/api`);
});

module.exports = app;
