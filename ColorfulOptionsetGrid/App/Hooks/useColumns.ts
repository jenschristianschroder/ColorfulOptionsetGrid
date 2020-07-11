import * as React from 'react';
import { allowedNodeEnvironmentFlags } from 'process';
type DataSet = ComponentFramework.PropertyTypes.DataSet;

export interface IColumnFeature{
    width: number;
    isVisible ?: boolean;
    order ?:number;
}


export interface IGridColumn{
    original : ComponentFramework.PropertyHelper.DataSetApi.Column;
    features : IColumnFeature,    
    minWidth : number;    
    maxWidth : number;    
}

interface IGridColumnAggregates {
    sum : number;
    count : number;
}

function calculateAggregatesBasedOnFeatures(cols : IGridColumn[]) : IGridColumnAggregates{
    return cols.reduce(({sum, count}, column) => {
        return { 
        sum : sum + (column.features.isVisible===true ? column.features.width : 0) + 14,
        count : count + (column.features.isVisible===true ? 1 : 0)
        };
    }, {sum:0, count:0});   
}



function parseColumns(originalColumns: ComponentFramework.PropertyHelper.DataSetApi.Column[]){        
    const calculatedColumns = originalColumns.map((column) => {
       return {
           original : column,
           features: {
               width : column.visualSizeFactor===-1 ? 75 : column.visualSizeFactor,  //here callbacks (optionset + 20)
               isVisible : !column.isHidden===true, 
               order: column.order===-1 ? 100 : column.order
           },
           minWidth:0,
           maxWidth:0
       }
    }).sort((c1, c2) => c1.features.order - c2.features.order );
    return {
        calculatedColumns, 
        aggregates : calculateAggregatesBasedOnFeatures(calculatedColumns)
    }
}

function recalculateWidth(calculatedColumns: IGridColumn[], aggregates: IGridColumnAggregates, availableWidth?: number): IGridColumn[]{
    const aggreatedWidth =  aggregates.sum + 50;           
    const widthBuffer = (availableWidth != null && availableWidth > aggreatedWidth) ? ((availableWidth - aggreatedWidth)/ aggregates.count) : 0;

    return calculatedColumns.map((intermediateColumn) => ({
        original : intermediateColumn.original,
        features : intermediateColumn.features,
        minWidth: intermediateColumn.features.width,
        maxWidth : intermediateColumn.features.width + widthBuffer
    }));
}

export const useColumns = (dataset: DataSet, availableWidth?: number) => {    
    const [state, setState] = React.useState(parseColumns(dataset.columns));           
    const [columns, setColumns] = React.useState<IGridColumn[]>(recalculateWidth(state.calculatedColumns, state.aggregates, availableWidth));    

    React.useEffect(() => {       
        const tempState = parseColumns(dataset.columns);        
        setState(tempState);        
        setColumns(recalculateWidth(tempState.calculatedColumns, tempState.aggregates, availableWidth));
    }, [dataset]);

    React.useEffect(() => {
        setColumns(recalculateWidth(state.calculatedColumns, state.aggregates, availableWidth));
    }, [availableWidth]);

    return {
        columns
    };
}