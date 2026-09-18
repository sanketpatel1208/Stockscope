#ifndef STOCK_H
#define STOCK_H

#define MAX_STOCKS 100

typedef struct
{
    int stock_id;
    char symbol[20];
    char company_name[100];
    char sector[100];

    float price;
    float market_cap;
    float pe_ratio;
    float roe;
    float debt;

} Stock;


/* Function declarations */

int loadStocks(Stock stocks[], const char filename[]);

void displayStock(const Stock *stock);

void displayAllStocks(const Stock stocks[], int count);

int searchStock(const Stock stocks[], int count, const char symbol[]);

void sortByPE(Stock stocks[], int count);

void sortByROE(Stock stocks[], int count);

void screenStocks(
    const Stock stocks[],
    int count,
    float maxPE,
    float minROE,
    float maxDebt
);

#endif