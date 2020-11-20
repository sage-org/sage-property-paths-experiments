from argparse import ArgumentParser, ArgumentTypeError
from seaborn import barplot
from pandas import read_csv
from matplotlib.pyplot import show

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

def plot_metric(data, metric, title, xlabel, ylabel):
    chart = barplot(x="query", y=metric, hue="approach", data=data)
    chart.set_yscale("log")
    chart.set_title(title, fontsize=12)
    chart.set_xlabel(xlabel, fontsize=12)
    chart.set_ylabel(ylabel, fontsize=12)
    chart.legend().set_title('')
    show()
    return chart

dataframe = read_csv(statistics_file, sep=',')
transform_ms_to_sec(dataframe)
transform_bytes_to_kbytes(dataframe)
print(dataframe)

exec_time_figure = plot_metric(dataframe, 'execution_time', '', 'execution time (sec)', '')
data_transfer_figure = plot_metric(dataframe, 'data_transfer', '', 'data transferred (KBytes)', '')

# exec_time_figure.get_figure().savefig(f'{output_directory}/execution_time.png')
# data_transfer_figure.get_figure().savefig(f'{output_directory}/data_transfer.png')