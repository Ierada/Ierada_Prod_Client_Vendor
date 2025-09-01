import React from "react";
import "@testing-library/jest-dom";
import { useNavigate } from "react-router";
import { useAppContext } from "../../../../context/AppContext";
import { deleteAd, getAdsByVendorId } from "../../../../services/api.ads";
import VendorAdlist from "../index";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

// Mocking dependencies
jest.mock("../../../../services/api.ads");
jest.mock("react-router", () => ({
  useNavigate: jest.fn(),
}));
jest.mock("../../../../context/AppContext", () => ({
  useAppContext: jest.fn(),
}));

describe("AdList() AdList method", () => {
  let navigateMock;
  let userMock;

  beforeEach(() => {
    navigateMock = jest.fn();
    useNavigate.mockReturnValue(navigateMock);
    userMock = { id: 1 };
    useAppContext.mockReturnValue({ user: userMock });
  });

  describe("Happy Paths", () => {
    it("should render the component and fetch ads successfully", async () => {
      // Arrange
      const adsMock = [
        {
          id: 1,
          product_id: "123",
          start_date: "2023-01-01",
          end_date: "2023-01-10",
          status: "approved",
          is_active: true,
          vendor_id: 1,
          amount: 100,
        },
      ];
      getAdsByVendorId.mockResolvedValueOnce(adsMock);

      // Act
      render(<VendorAdlist />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText("Ads List")).toBeInTheDocument();
        expect(screen.getByText("Product Name")).toBeInTheDocument();
        expect(screen.getByText("Start Date")).toBeInTheDocument();
        expect(screen.getByText("End Date")).toBeInTheDocument();
        expect(screen.getByText("Status")).toBeInTheDocument();
        expect(screen.getByText("Actions")).toBeInTheDocument();
      });
    });

    it("should navigate to create ad page on button click", () => {
      // Arrange
      render(<VendorAdlist />);
      const addButton = screen.getByText("+ Add Ads");

      // Act
      fireEvent.click(addButton);

      // Assert
      expect(navigateMock).toHaveBeenCalledWith("/ads/create");
    });
  });

  describe("Edge Cases", () => {
    it("should handle no ads returned from API", async () => {
      // Arrange
      getAdsByVendorId.mockResolvedValueOnce([]);

      // Act
      render(<VendorAdlist />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText("Ads List")).toBeInTheDocument();
        expect(screen.queryByText("Product Name")).not.toBeInTheDocument();
      });
    });

    it("should handle API error gracefully", async () => {
      // Arrange
      getAdsByVendorId.mockRejectedValueOnce(new Error("API Error"));

      // Act
      render(<VendorAdlist />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText("Ads List")).toBeInTheDocument();
        expect(screen.queryByText("Product Name")).not.toBeInTheDocument();
      });
    });

    it("should handle ad deletion", async () => {
      // Arrange
      const adsMock = [
        {
          id: 1,
          product_id: "123",
          start_date: "2023-01-01",
          end_date: "2023-01-10",
          status: "approved",
          is_active: true,
          vendor_id: 1,
          amount: 100,
        },
      ];
      getAdsByVendorId.mockResolvedValueOnce(adsMock);
      deleteAd.mockResolvedValueOnce();

      // Act
      render(<VendorAdlist />);
      await waitFor(() => screen.getByText("Product Name"));
      const deleteButton = screen.getByRole("button", { name: /delete/i });
      fireEvent.click(deleteButton);

      // Assert
      await waitFor(() => {
        expect(deleteAd).toHaveBeenCalledWith(1);
        expect(screen.queryByText("Product Name")).not.toBeInTheDocument();
      });
    });
  });
});
