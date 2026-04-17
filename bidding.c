// bidding.c - Bidding Management Functions

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_BIDDINGS 100

typedef struct {
    int id;
    char name[50];
    float amount;
} Bidding;

Bidding biddings[MAX_BIDDINGS];
int biddingCount = 0;

void registerBidding(int id, const char* name, float amount) {
    if (biddingCount < MAX_BIDDINGS) {
        biddings[biddingCount].id = id;
        strncpy(biddings[biddingCount].name, name, sizeof(biddings[biddingCount].name) - 1);
        biddings[biddingCount].amount = amount;
        biddingCount++;
    } else {
        printf("Bidding list is full!\n");
    }
}

Bidding* searchBidding(int id) {
    for (int i = 0; i < biddingCount; i++) {
        if (biddings[i].id == id) {
            return &biddings[i];
        }
    }
    return NULL;
}

void filterBiddings(float minAmount) {
    printf("Filtered Biddings (greater than %.2f):\n", minAmount);
    for (int i = 0; i < biddingCount; i++) {
        if (biddings[i].amount > minAmount) {
            printf("ID: %d, Name: %s, Amount: %.2f\n", biddings[i].id, biddings[i].name, biddings[i].amount);
        }
    }
}

void displayAllBiddings() {
    printf("All Biddings:\n");
    for (int i = 0; i < biddingCount; i++) {
        printf("ID: %d, Name: %s, Amount: %.2f\n", biddings[i].id, biddings[i].name, biddings[i].amount);
    }
}

void createFolderStructure() {
    system("mkdir -p bids");
    printf("Folder structure created under 'bids' folder.\n");
}

int main() {
    createFolderStructure();
    registerBidding(1, "Bidding1", 150.00);
    registerBidding(2, "Bidding2", 200.00);
    displayAllBiddings();
    filterBiddings(180.00);
    return 0;
}