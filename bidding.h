#ifndef BIDDING_H
#define BIDDING_H

#include <stdbool.h>

// Structure to represent a Bid
typedef struct {
    int bidId;
    double amount;
    char bidderName[100];
    char item[100];
    char timePlaced[20]; // Format: YYYY-MM-DD HH:MM:SS
} Bid;

// Function to place a new bid
bool placeBid(int bidId, double amount, const char* bidderName, const char* item);

// Function to view a bid
Bid viewBid(int bidId);

// Function to delete a bid
bool deleteBid(int bidId);

#endif // BIDDING_H
