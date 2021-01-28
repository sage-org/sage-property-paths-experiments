from argparse import ArgumentParser, ArgumentTypeError
from seaborn import barplot
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

def transform_ms_to_sec(data):
    data['execution_time'] = data['execution_time'].div(1000)

def transform_bytes_to_kbytes(data):
    data['data_transfer'] = data['data_transfer'].div(1024)

def transform_queries_name(data):
    data['query'] = data['query'].str.split('_').str[-1]
    data['query'] = data['query'].astype(int)

def sort_by_query_names(data):
    return data.sort_values(by=['approach', 'query'])

def sort_by_approach(data):
    data.loc[data['approach'] == 'Virtuoso', 'order'] = 1
    data.loc[data['approach'] == 'Jena-Fuseki', 'order'] = 2
    data.loc[data['approach'] == 'SaGe-PTC-20', 'order'] = 3
    data.loc[data['approach'] == 'SaGe-PTC-5', 'order'] = 4
    data.loc[data['approach'] == 'SaGe-Multi', 'order'] = 5
    return data.sort_values(by=['order', 'query'])

def add_lantency(data):
    data['execution_time'] = data['execution_time'] + (data['http_calls'] * 0.1)

def handle_timeout_and_errors(data):
    data['http_calls'] = np.where(data['state'] == 'timeout', data['http_calls'].max(), data['http_calls'])
    data['http_calls'] = np.where(data['state'] == 'error', data['http_calls'].max(), data['http_calls'])
    data['execution_time'] = np.where(data['state'] == 'timeout', data['execution_time'].max(), data['execution_time'])
    data['execution_time'] = np.where(data['state'] == 'error', data['execution_time'].max(), data['execution_time'])
    data['data_transfer'] = np.where(data['state'] == 'timeout', data['data_transfer'].max(), data['data_transfer'])
    data['data_transfer'] = np.where(data['state'] == 'error', data['data_transfer'].max(), data['data_transfer'])

def get_position(rects):
    position = 0
    for idx,rect in enumerate(rects): 
        y = rect.get_height()
        if y > 0 and (position == 0 or y < position):
            position = y
    return position

def autolabel(rects, data, metric):
    labels = list(data['state'])
    position = get_position(rects)
    for idx,rect in enumerate(rects):
        x = rect.get_x() + rect.get_width()/2.
        y = position
        label = labels[idx] if (labels[idx] == 'timeout' or labels[idx] == 'error') else ''
        plt.annotate(label, (x, y), ha='center', va='bottom', fontsize='small', rotation=90)

def plot_metric(ax, data, metric, title, xlabel, ylabel, logscale=False):
    chart = barplot(x="query", y=metric, hue="approach", data=data, ax=ax)
    if logscale:
        chart.set_yscale("log", basey=10)
    chart.set_title(title)
    chart.set_xlabel(xlabel)
    chart.set_ylabel(ylabel)
    chart.legend().set_title('')
    chart.set_xticklabels(
        [f'Q{textObject.get_text()}' for textObject in chart.get_xticklabels()],
        rotation=0, 
        horizontalalignment='center',
        fontweight='light',
        fontsize='medium'
    )
    autolabel(chart.patches, data, metric)

def create_figure(data, metric, title, xlabel, ylabel, logscale=False):
    first = data[(data['query'] > 0) & (data['query'] <= 10)]
    second = data[(data['query'] > 10) & (data['query'] <= 20)]
    third = data[(data['query'] > 20) & (data['query'] <= 30)]
    fig = plt.figure(figsize=(8, 6))
    plt.subplots_adjust(hspace=0.3)
    ax1 = fig.add_subplot(311)
    plot_metric(ax1, first, metric, title, '', '', logscale=logscale)
    plt.legend(loc='upper center', bbox_to_anchor=(0.5, 1.35), fancybox=True, shadow=True, ncol=5)
    ax2 = fig.add_subplot(312)
    plot_metric(ax2, second, metric, '', xlabel, ylabel, logscale=logscale)
    plt.legend().remove()
    ax3 = fig.add_subplot(313)
    plot_metric(ax3, third, metric, '', '', '', logscale=logscale)
    plt.legend().remove()
    return fig

dataframe = read_csv(statistics_file, sep=',')
print(dataframe)
transform_bytes_to_kbytes(dataframe)
transform_queries_name(dataframe)
# add_lantency(dataframe)
# handle_timeout_and_errors(dataframe)
sorted_dataframe = sort_by_approach(dataframe)
print(sorted_dataframe)

exec_time_figure = create_figure(sorted_dataframe, 'execution_time', '', '', 'execution time (sec)', logscale=True)
exec_time_figure.savefig(f'{output_directory}/execution_time.png')

data_transfer_figure = create_figure(sorted_dataframe, 'data_transfer', '', '', 'data transferred (KBytes)', logscale=True)
data_transfer_figure.savefig(f'{output_directory}/data_transfer.png')

http_calls_figure = create_figure(sorted_dataframe, 'http_calls', '', '', 'number of HTTP calls', logscale=True)
http_calls_figure.savefig(f'{output_directory}/http_calls.png')

nb_results_figure = create_figure(sorted_dataframe, 'nb_results', '', '', 'number of results', logscale=True)
nb_results_figure.savefig(f'{output_directory}/nb_results.png')