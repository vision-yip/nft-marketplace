import { type CustomValidator } from "tdesign-react";

export const validateAddress: CustomValidator = (value: string) => {
  if (!value.startsWith('0x')) {
    return { result: false, message: 'NFT Address must start with 0x', type: 'error' };
  } else if (value.length !== 42) {
    return { result: false, message: 'NFT Address must be 42 characters', type: 'error' };
  }
  return { result: true, message: 'Correct!', type: 'success' };
};

export const validateTokenId: CustomValidator = (value: string) => {
  if (value === '') {
    return { result: false, message: 'Token ID is required!', type: 'error' };
  }
  return { result: true, message: 'Correct!', type: 'success' };
};

export const validatePrice: CustomValidator = (value: string) => {
  const price = Number(value);
  if (isNaN(price)) {
    return { result: false, message: 'Price must be a number', type: 'error' };
  }
  if (price <= 0) {
    return { result: false, message: 'Price must be greater than 0', type: 'error' };
  }
  return { result: true, message: 'Correct!', type: 'success' };
};
