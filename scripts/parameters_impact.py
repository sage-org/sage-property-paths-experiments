from argparse import ArgumentParser, ArgumentTypeError
from seaborn import boxplot
from pandas import read_csv
import numpy as np
import matplotlib.pyplot as plt

# ====================================================================================================
# ===== Command line interface =======================================================================
# ====================================================================================================

parser = ArgumentParser()
parser.add_argument("--input", "-i", help="The file that contains queries evaluation statistics", default=None)
parser.add_argument("--output", "-o", help="The directory where the figure will be saved", default=None)
args = parser.parse_args()

statistics_file = args.input
output_directory = args.output

if statistics_file is None or output_directory is None:
    print('Error: missing required arguments ! USAGE: plots.py --input <statistics> --output <directory>')
    exit(1)

# ====================================================================================================
# ===== Figures construction =========================================================================
# ====================================================================================================

def transform_bytes_to_kbytes(data):
    data['data_transfer'] = data['data_transfer'].div(1024)

def sort_by_approach(data):
    data['order'] = data['approach'].str.split('-').str[-1]
    data['order'] = data['order'].astype(int)
    # data.loc[data['approach'] == 'SaGe-PTC-500ms', 'order'] = 1
    # data.loc[data['approach'] == 'SaGe-PTC-1sec', 'order'] = 2
    # data.loc[data['approach'] == 'SaGe-PTC-60sec', 'order'] = 3
    return data.sort_values(by=['order', 'query'])

def add_lantency(data):
    data['execution_time'] = data['execution_time'] + (data['http_calls'] * 0.1)

def filter_timeout_and_errors(data):
    discarded_queries = data[(data['state'] == 'error') | (data['state'] == 'timeout')]['query'].unique()
    return data[~data['query'].isin(discarded_queries)]

def plot_metric(ax, data, metric, title, xlabel, ylabel, logscale=False):
    chart = boxplot(x="approach", y=metric, data=data, ax=ax)
    if logscale:
        chart.set_yscale("log", basey=10)
    chart.set_title(title)
    chart.set_xlabel(xlabel)
    chart.set_ylabel(ylabel)
    chart.legend().set_title('')
    chart.set_xticklabels(
        chart.get_xticklabels(),
        rotation=30, 
        horizontalalignment='right',
        fontweight='bold',
        fontsize='medium'
    )

def create_figure(data, logscale=False):
    fig = plt.figure(figsize=(8, 4))
    plt.subplots_adjust(wspace=0.5, bottom=0.25, top=0.98)
    ax1 = fig.add_subplot(131)
    plot_metric(ax1, data, 'execution_time', '', '', 'execution time (sec)', logscale=logscale)
    plt.legend().remove()
    ax2 = fig.add_subplot(132)
    plot_metric(ax2, data, 'data_transfer', '', '', 'data transferred (KBytes)', logscale=logscale)
    plt.legend().remove()
    ax3 = fig.add_subplot(133)
    plot_metric(ax3, data, 'http_calls', '', '', 'number of HTTP calls', logscale=logscale)
    plt.legend().remove()
    return fig

dataframe = read_csv(statistics_file, sep=',')
print(dataframe)
transform_bytes_to_kbytes(dataframe)
# add_lantency(dataframe)
dataframe = filter_timeout_and_errors(dataframe)
sorted_dataframe = sort_by_approach(dataframe)
print(sorted_dataframe)

figure = create_figure(sorted_dataframe, logscale=True)
figure.savefig(f'{output_directory}/figure.png')