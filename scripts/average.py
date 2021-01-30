#!/bin/python3

import sys
import pandas as pd
import numpy as np


def compute_average(files):
    data = list()
    for i in range(len(files)):
        df = pd.read_csv(files[i], sep=',')
        data.append(df)
    df = pd.concat(data)

    metrics = [
        'execution_time',
        'nb_calls', 
        'data_transfer', 
        'data_transfer_approach_overhead', 
        'data_transfer_duplicates_overhead', 
        'nb_duplicates',
        'nb_solutions',
        'state'
    ]

    df.loc[df['state'] == 'error', 'state'] = 1
    df.loc[df['state'] == 'timeout', 'state'] = 2
    df.loc[df['state'] == 'incomplete', 'state'] = 3
    df.loc[df['state'] == 'complete', 'state'] = 4

    group_by_variables = [column for column in list(df.columns) if column not in metrics]

    df = df.groupby(group_by_variables).agg({
        'execution_time': np.mean,
        'nb_calls': np.mean,
        'data_transfer': np.mean,
        'data_transfer_approach_overhead': np.mean,
        'data_transfer_duplicates_overhead': np.mean,
        'nb_duplicates': np.mean,
        'nb_solutions': np.mean,
        'state': np.min
    })

    df.loc[df['state'] == 1, 'state'] = 'error'
    df.loc[df['state'] == 2, 'state'] = 'timeout'
    df.loc[df['state'] == 3, 'state'] = 'incomplete'
    df.loc[df['state'] == 4, 'state'] = 'complete'

    return df


if __name__ == '__main__':
    output = sys.argv[1]
    files = sys.argv[2:]
    result = compute_average(files)
    with open(output, 'w') as out_file:
        out_file.write(result.to_csv())