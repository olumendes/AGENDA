# Makefile

CC = gcc
CFLAGS = -Wall -Wextra
LDFLAGS = -lsqlite3

all: main

main: main.o
	$(CC) $(CFLAGS) -o main main.o $(LDFLAGS)

main.o: main.c
	$(CC) $(CFLAGS) -c main.c

clean:
	rm -f *.o main
