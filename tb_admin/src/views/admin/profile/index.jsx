
// Chakra imports
import { 
  Box, 
  Text, 
  SimpleGrid, 
  useColorModeValue,
  Button,
  Icon,
  VStack,
  HStack
} from "@chakra-ui/react";
import Card from "components/card/Card.js";
import React from "react";
import { MdLogin, MdPersonAdd } from "react-icons/md";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorBrand = useColorModeValue("brand.500", "white");
  const bg = useColorModeValue("white", "navy.700");

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <VStack spacing={6} align="center" mb={10}>
        <Text
          color={textColor}
          fontSize="32px"
          fontWeight="700"
          lineHeight="100%"
        >
          Authentication
        </Text>
        <Text
          color="secondaryGray.600"
          fontSize="16px"
          fontWeight="400"
          textAlign="center"
          maxW="400px"
        >
          Access authentication pages for sign in and sign up functionality.
        </Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing="20px" maxW="800px" mx="auto">
        {/* Sign In Card */}
        <Card p="30px" bg={bg}>
          <VStack spacing={6} align="center">
            <Box
              w="80px"
              h="80px"
              bg="brand.100"
              borderRadius="20px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={MdLogin} w="40px" h="40px" color={textColorBrand} />
            </Box>
            
            <VStack spacing={2} align="center">
              <Text
                color={textColor}
                fontSize="24px"
                fontWeight="700"
                textAlign="center"
              >
                Sign In
              </Text>
              <Text
                color="secondaryGray.600"
                fontSize="14px"
                fontWeight="400"
                textAlign="center"
              >
                Access the admin panel with your credentials
              </Text>
            </VStack>

            <Button
              bg="brand.500"
              color="white"
              _hover={{ bg: "brand.600" }}
              _active={{ bg: "brand.700" }}
              w="100%"
              h="50px"
              borderRadius="12px"
              fontSize="16px"
              fontWeight="600"
              onClick={() => navigate('/auth/sign-in')}
            >
              Go to Sign In
            </Button>
          </VStack>
        </Card>

        {/* Sign Up Card */}
        <Card p="30px" bg={bg}>
          <VStack spacing={6} align="center">
            <Box
              w="80px"
              h="80px"
              bg="green.100"
              borderRadius="20px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={MdPersonAdd} w="40px" h="40px" color="green.500" />
            </Box>
            
            <VStack spacing={2} align="center">
              <Text
                color={textColor}
                fontSize="24px"
                fontWeight="700"
                textAlign="center"
              >
                Sign Up
              </Text>
              <Text
                color="secondaryGray.600"
                fontSize="14px"
                fontWeight="400"
                textAlign="center"
              >
                Create a new admin account
              </Text>
            </VStack>

            <Button
              bg="green.500"
              color="white"
              _hover={{ bg: "green.600" }}
              _active={{ bg: "green.700" }}
              w="100%"
              h="50px"
              borderRadius="12px"
              fontSize="16px"
              fontWeight="600"
              onClick={() => navigate('/auth/signup')}
            >
              Go to Sign Up
            </Button>
          </VStack>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
