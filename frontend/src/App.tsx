import { useState } from "react";
import React, { Component }  from 'react';
import { Button, Input, FormControl, FormLabel, Box, Flex, Text, ChakraProvider } from "@chakra-ui/react";
// import "./App.css";

export default function App() {
  const [result, setResult] = useState();
  const [question, setQuestion] = useState();
  const [file, setFile] = useState();

  const handleQuestionChange = (event: any) => {
    setQuestion(event.target.value);
  };

  const handleFileChange = (event: any) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();

    const formData = new FormData();

    if (file) {
      formData.append("file", file);
    }
    if (question) {
      formData.append("question", question);
    }

    fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          showSuccessPopup(); // Show success popup if response is OK
      }
      return response.json();
    })  
      .then((data) => {
        setResult(data.response);
      })
      .catch((error) => {
        console.error("Error", error);
      });
  };

  const showSuccessPopup = () => {
    window.alert("File uploaded successfully!"); // Simple alert popup
  }

  return (
    <ChakraProvider>
    <Box
      backgroundImage="url('https://media.istockphoto.com/id/1136756218/vector/abstract-template-black-frame-layout-with-green-neon-light-on-dark-background-futuristic.webp?b=1&s=612x612&w=0&k=20&c=zT4dSpuU6CZxZQnS0miqFEx6DGK6R5nqxXZRF4SkwgM=')" // Replace with your image URL
      backgroundSize="cover"
        backgroundPosition="center"
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Flex
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          p="4"
          bg="rgba(255, 255, 255, 0.8)"
          borderRadius="md"
          boxShadow="md"
        >
          <Box width="400px" mb="4">
            <FormControl id="question">
              <FormLabel fontSize="lg" textAlign="center" fontFamily="Montserrat, sans-serif">Question:</FormLabel>
              <Input
                type="text"
                value={question}
                onChange={handleQuestionChange}
                placeholder="Ask your question here"
                size="lg"
              />
            </FormControl>

            <br />
            <FormControl id="file">
              <FormLabel fontSize="lg" textAlign="center" fontFamily="Montserrat, sans-serif">Upload CSV, TXT, DOC or PDF file:</FormLabel>
              <Input
                type="file"
                accept=".pdf,.csv,.docx,.txt"
                onChange={handleFileChange}
                size="lg"
              />
            </FormControl>

            <br />
            <Box width="400px" textAlign="center" mt="4">
            <Button
              type="submit"
              disabled={!file || !question}
              size="lg"
              mt="4"
              onClick={handleSubmit}
              textAlign="center"
            >
              Submit
            </Button>
            </Box>
          </Box>

          <Box width="400px">
            <Text fontSize="lg" textAlign="center" fontFamily="Montserrat, sans-serif">Result: {result}</Text>
          </Box>
        </Flex>
      </Box>
    </ChakraProvider>
  );
  }
