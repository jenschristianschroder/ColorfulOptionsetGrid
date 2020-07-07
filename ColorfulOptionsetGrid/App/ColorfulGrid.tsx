import * as React from 'react';
import {DetailsList, IColumn, DetailsListLayoutMode, IDetailsFooterProps, ISelection} from '@fluentui/react/lib/DetailsList';
import {mergeStyles } from '@fluentui/react/lib/Styling';
import { useGetAttributes } from './Hooks/useGetMetadata';
import {Icon} from '@fluentui/react/lib/Icon';
import {initializeIcons} from '@fluentui/react/lib/Icons';
import {Fabric} from '@fluentui/react/lib/Fabric';
import {ScrollablePane} from '@fluentui/react/lib/ScrollablePane';
import {IRenderFunction} from '@fluentui/react/lib/Utilities';
import {Sticky, StickyPositionType} from '@fluentui/react/lib/Sticky';
import {Label} from '@fluentui/react/lib/Label';
import {CommandBar, ICommandBarItemProps} from '@fluentui/react/lib/CommandBar';
import {MarqueeSelection} from '@fluentui/react/lib/MarqueeSelection';
type DataSet = ComponentFramework.PropertyTypes.DataSet;

initializeIcons();

export interface IColorfulGridProps{
    dataset: DataSet;    
    utils : ComponentFramework.Utility;
}

export const ColorfulGrid = ({dataset, utils} : IColorfulGridProps) : JSX.Element => {
    const customizedColors = dataset.columns.filter((column) => ["column1", "column2", "column3"].includes(column.alias));    
    //found customized, or take all optionset columns otherwise
    const optionSetColumns = (customizedColors.length >0 ? customizedColors : dataset.columns.filter((column) => column.dataType==="OptionSet")).map((column) => column.name);

    //const optionSetColumns = ["column1", "column2", "column3", "column4"].map((alias) => dataset.columns.find((column) => column.alias===alias)?.name ?? alias); 
    const metadataAttributes = useGetAttributes(dataset.getTargetEntityType(), optionSetColumns, utils );
    const columns = dataset.columns.map((column) : IColumn => {
        const meta = metadataAttributes?.options.get(column.name);
        return {
            key: column.name,
            name : column.displayName,             
            fieldName: column.name,
            minWidth : column.visualSizeFactor,
            maxWidth: column.visualSizeFactor,
            isResizable: true, 
            onRender: column.dataType==="OptionSet"  ? (item : any) => {
                //border
                //return  <div style={{ overflow: "hidden", borderWidth: "1px", borderStyle: "solid", borderColor: meta?.get(item.raw.getValue(column.name)) ?? "black", color: meta?.get(item.raw.getValue(column.name)) ?? "black", paddingLeft: "5px", paddingTop: "3px", paddingBottom: "3px", borderRadius: "5px"}}>{item[column.name]}</div>  
                //box
                //return  <div style={{overflow: "hidden", backgroundColor: meta?.get(item.raw.getValue(column.name)) ?? "black", color: "white", paddingLeft: "5px", paddingTop: "3px", paddingBottom: "3px", borderRadius: "5px"}}>{item[column.name]}</div>  
                //icon
                return  <div> <Icon className="colorIcon" style={{color: meta?.get(item.raw.getValue(column.name)) ?? "white", marginRight: "5px"}} iconName="CircleShapeSolid" aria-hidden="true" /><span>{item[column.name]}</span></div>  
              } : undefined,                  
        };
    });   
    const items = dataset.sortedRecordIds.map((id) => {                
        const entityIn = dataset.records[id];
        const attributes = dataset.columns.map((column) => ({[column.name]: entityIn.getFormattedValue(column.name)}));
        return Object.assign({
                key: entityIn.getRecordId(),
                raw : entityIn
            },
            ...attributes)
    });      
    
    const cmdBarFarItems: ICommandBarItemProps[] = [];
    const cmdBarItems: ICommandBarItemProps[] = [];
    const totalRecords: number = 25;

    const _onRenderDetailsFooter = (props: IDetailsFooterProps | undefined, defaultRender?: IRenderFunction<IDetailsFooterProps>): JSX.Element => {
        return (
            <Sticky stickyPosition={StickyPositionType.Footer} isScrollSynced={true}>
                <div> 
                    <Label className={"listFooterLabel"}>{`25 selected`}</Label>
                    <CommandBar className={"cmdbar"} farItems={cmdBarFarItems} items={cmdBarItems} />                    
                </div>
            </Sticky>
        );
    }
   

    return (
        <div style={{width: "100%", height: "100%", position: "relative"}}>
            <ScrollablePane scrollbarVisibility={"auto"} >
          
                <DetailsList 
                    onRenderDetailsFooter={_onRenderDetailsFooter}
                    items={items} 
                    columns={columns}                     
                    layoutMode={DetailsListLayoutMode.justified}>        
                </DetailsList>
          
            </ScrollablePane>
            </div>
        
    );
}