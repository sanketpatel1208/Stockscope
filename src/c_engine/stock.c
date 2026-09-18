#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#include "stock.h"


/*
    Load stock data from CSV file
*/
int loadStocks(Stock stocks[], const char filename[])
{
    FILE *file;
    char line[500];

    int count = 0;

    file = fopen(filename, "r");

    if (file == NULL)
    {
        printf("Error: Could not open file.\n");
        return 0;
    }

    /* Skip CSV header */
    fgets(line, sizeof(line), file);

    while (fgets(line, sizeof(line), file) != NULL &&
           count < MAX_STOCKS)
    {
        char *token;

        token = strtok(line, ",");
        if (token == NULL)
            continue;

        stocks[count].stock_id = count + 1;

        strcpy(stocks[count].symbol, token);

        token = strtok(NULL, ",");
        if (token != NULL)
            strcpy(stocks[count].company_name, token);

        token = strtok(NULL, ",");
        if (token != NULL)
            strcpy(stocks[count].sector, token);

        token = strtok(NULL, ",");
        stocks[count].price =
            token ? atof(token) : 0;

        token = strtok(NULL, ",");
        stocks[count].market_cap =
            token ? atof(token) : 0;

        token = strtok(NULL, ",");
        stocks[count].pe_ratio =
            token ? atof(token) : 0;

        token = strtok(NULL, ",");
        stocks[count].roe =
            token ? atof(token) : 0;

        token = strtok(NULL, ",");
        stocks[count].debt =
            token ? atof(token) : 0;

        count++;
    }

    fclose(file);

    return count;
}


/*
    Display one stock
*/
void displayStock(const Stock *stock)
{
    printf("\n----------------------------------------\n");

    printf("Symbol       : %s\n", stock->symbol);
    printf("Company      : %s\n", stock->company_name);
    printf("Sector       : %s\n", stock->sector);

    printf("Price        : %.2f\n", stock->price);
    printf("Market Cap   : %.2f\n", stock->market_cap);
    printf("P/E Ratio    : %.2f\n", stock->pe_ratio);
    printf("ROE          : %.2f\n", stock->roe);
    printf("Debt         : %.2f\n", stock->debt);

    printf("----------------------------------------\n");
}


/*
    Display all stocks
*/
void displayAllStocks(const Stock stocks[], int count)
{
    int i;

    printf("\n");
    printf("================================================================================================\n");

    printf("%-5s %-15s %-35s %-25s %-12s %-10s %-10s\n",
           "ID",
           "Symbol",
           "Company",
           "Sector",
           "Price",
           "P/E",
           "ROE");

    printf("================================================================================================\n");

    for (i = 0; i < count; i++)
    {
        printf("%-5d %-15s %-35s %-25s %-12.2f %-10.2f %-10.2f\n",
               stocks[i].stock_id,
               stocks[i].symbol,
               stocks[i].company_name,
               stocks[i].sector,
               stocks[i].price,
               stocks[i].pe_ratio,
               stocks[i].roe);
    }

    printf("================================================================================================\n");
}


/*
    Search stock by symbol
*/
int searchStock(
    const Stock stocks[],
    int count,
    const char symbol[]
)
{
    int i;

    for (i = 0; i < count; i++)
    {
        if (strcmp(stocks[i].symbol, symbol) == 0)
        {
            return i;
        }
    }

    return -1;
}


/*
    Sort stocks by P/E ratio
*/
void sortByPE(Stock stocks[], int count)
{
    int i, j;

    Stock temp;

    for (i = 0; i < count - 1; i++)
    {
        for (j = 0; j < count - i - 1; j++)
        {
            if (stocks[j].pe_ratio > stocks[j + 1].pe_ratio)
            {
                temp = stocks[j];

                stocks[j] = stocks[j + 1];

                stocks[j + 1] = temp;
            }
        }
    }
}


/*
    Sort stocks by ROE
*/
void sortByROE(Stock stocks[], int count)
{
    int i, j;

    Stock temp;

    for (i = 0; i < count - 1; i++)
    {
        for (j = 0; j < count - i - 1; j++)
        {
            if (stocks[j].roe < stocks[j + 1].roe)
            {
                temp = stocks[j];

                stocks[j] = stocks[j + 1];

                stocks[j + 1] = temp;
            }
        }
    }
}


/*
    Stock screening engine
*/
void screenStocks(
    const Stock stocks[],
    int count,
    float maxPE,
    float minROE,
    float maxDebt
)
{
    int i;
    int found = 0;

    printf("\n");
    printf("================================================================================\n");
    printf("                    STOCK SCREENING RESULTS\n");
    printf("================================================================================\n");

    printf("Criteria:\n");
    printf("P/E Ratio <= %.2f\n", maxPE);
    printf("ROE       >= %.2f\n", minROE);
    printf("Debt      <= %.2f\n", maxDebt);

    printf("\n");

    printf("%-15s %-30s %-10s %-10s %-15s\n",
           "Symbol",
           "Company",
           "P/E",
           "ROE",
           "Debt");

    printf("--------------------------------------------------------------------------------\n");

    for (i = 0; i < count; i++)
    {
        if (stocks[i].pe_ratio <= maxPE &&
            stocks[i].roe >= minROE &&
            stocks[i].debt <= maxDebt)
        {
            printf("%-15s %-30s %-10.2f %-10.2f %-15.2f\n",
                   stocks[i].symbol,
                   stocks[i].company_name,
                   stocks[i].pe_ratio,
                   stocks[i].roe,
                   stocks[i].debt);

            found++;
        }
    }

    if (found == 0)
    {
        printf("No stocks satisfy all selected criteria.\n");
    }

    printf("\nStocks passing criteria: %d\n", found);
}
