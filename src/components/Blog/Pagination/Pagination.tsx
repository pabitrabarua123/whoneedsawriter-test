'use client';

import { Flex, Button, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export const Pagination = ({ currentPage, totalPages }: PaginationProps) => {
  const router = useRouter();

  const handlePageChange = (newPage: number) => {
    router.push(`/blog?page=${newPage}`);
  };

  return (
    <Flex justify="center" align="center" mt="48px" gap="16px">
      <Button
        onClick={() => handlePageChange(currentPage - 1)}
        isDisabled={currentPage === 1}
        variant="outline"
      >
        Previous
      </Button>
      
      <Text>
        Page {currentPage} of {totalPages}
      </Text>
      
      <Button
        onClick={() => handlePageChange(currentPage + 1)}
        isDisabled={currentPage === totalPages}
        variant="outline"
      >
        Next
      </Button>
    </Flex>
  );
}; 