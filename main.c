#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_BIDS 100
#define MAX_USERS 50

typedef struct {
    int id;
    char item[100];
    float amount;
} Bid;

typedef struct {
    int userId;
    char username[50];
    char password[50];
} User;

Bid bids[MAX_BIDS];
User users[MAX_USERS];
int bidCount = 0;
int userCount = 0;

void registerUser(int userId, const char *username, const char *password) {
    if (userCount < MAX_USERS) {
        users[userCount].userId = userId;
        strcpy(users[userCount].username, username);
        strcpy(users[userCount].password, password);
        userCount++;
    } else {
        printf("User limit reached.\n");
    }
}

void placeBid(int id, const char *item, float amount) {
    if (bidCount < MAX_BIDS) {
        bids[bidCount].id = id;
        strcpy(bids[bidCount].item, item);
        bids[bidCount].amount = amount;
        bidCount++;
    } else {
        printf("Bid limit reached.\n");
    }
}

void searchBid(int id) {
    for (int i = 0; i < bidCount; i++) {
        if (bids[i].id == id) {
            printf("Bid found: %s - $%.2f\n", bids[i].item, bids[i].amount);
            return;
        }
    }
    printf("Bid not found.\n");
}

void filterBids(float minAmount) {
    printf("Filtered Bids: \n");
    for (int i = 0; i < bidCount; i++) {
        if (bids[i].amount >= minAmount) {
            printf("%s - $%.2f\n", bids[i].item, bids[i].amount);
        }
    }
}

void createFolder(const char *folderName) {
    #ifdef _WIN32
        _mkdir(folderName);
    #else
        mkdir(folderName, 0777);
    #endif
}

int main() {
    // Example Usage
    registerUser(1, "user1", "pass1");
    placeBid(1, "Item1", 10.0);
    placeBid(2, "Item2", 25.0);

    searchBid(1);
    filterBids(15.0);
    createFolder("bids");

    return 0;
}
