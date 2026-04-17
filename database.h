# Database Header Definitions for Bidding Structure

#ifndef DATABASE_H
#define DATABASE_H

// Struct to represent a bid
struct Bid {
    int id;
    double amount;
    char bidderName[100];
    char item[100];
};

// Function declarations
void addBid(struct Bid bid);
struct Bid getBid(int id);
void deleteBid(int id);
void listBids();

#endif // DATABASE_H
