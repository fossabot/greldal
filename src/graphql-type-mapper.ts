import { MappedDataSource, DataSourceMapping } from "./MappedDataSource";
import * as t from "io-ts";
import {
    GraphQLObjectType,
    GraphQLFieldConfig,
    GraphQLFieldConfigMap,
    GraphQLInputObjectType,
    GraphQLInputFieldConfigMap,
    GraphQLInputFieldConfig,
    GraphQLString,
    GraphQLFloat,
    GraphQLList,
    GraphQLBoolean,
    GraphQLOutputType,
    GraphQLScalarType,
    GraphQLFieldMap,
    GraphQLInputType,
} from "graphql";
import { transform, uniqueId } from "lodash";
import { MappedField } from "./MappedField";
import { Dict, Maybe } from "./util-types";
import { MappedAssociation } from "./MappedAssociation";

export const deriveDefaultOutputType = <T extends MappedDataSource>(mappedDataSource: T) =>
    new GraphQLObjectType({
        name: mappedDataSource.mappedName,
        fields: mapOutputAssociationFields(mappedDataSource, mapOutputFields(mappedDataSource)),
    });

export const deriveDefaultShallowInputType = <T extends MappedDataSource>(mappedDataSource: T) =>
    new GraphQLInputObjectType({
        name: `${mappedDataSource.mappedName}Input`,
        fields: mapInputFields(mappedDataSource),
    });

export const deriveDefaultShallowOutputType = <T extends MappedDataSource>(mappedDataSource: T) =>
    new GraphQLObjectType({
        name: `Shallow${mappedDataSource.mappedName}`,
        fields: mapOutputFields(mappedDataSource),
    });

export const mapInputFields = (ds: MappedDataSource, result: GraphQLInputFieldConfigMap = {}) =>
    transform<MappedField, GraphQLInputFieldConfig>(
        ds.fields,
        (fields, field, name) => {
            fields[name] = {
                type: field.inputType,
                description: field.description,
            };
        },
        result,
    );

export const mapOutputFields = (ds: MappedDataSource, result: GraphQLFieldConfigMap<any, any> = {}) =>
    transform<MappedField, GraphQLFieldConfig<any, any>>(
        ds.fields,
        (fields, field, name) => {
            fields[name] = {
                type: field.outputType,
                description: field.description,
            };
        },
        result,
    );

export const mapOutputAssociationFields = (ds: MappedDataSource, result: GraphQLFieldConfigMap<any, any> = {}) =>
    transform<MappedAssociation[], GraphQLFieldConfig<any, any>>(
        ds.associations,
        (fields, associations, name) => {
            if (associations.length === 0) return;
            fields[name] = {
                type: associations[0].from.defaultOutputType,
                description: associations[0].description,
            };
        },
        result,
    );

export function ioToGraphQLOutputType(type: t.Type<any>, id: string): GraphQLOutputType {
    const scalar = ioToGraphQLScalarType(type);
    if (scalar) return scalar;
    if (type instanceof t.ArrayType) return GraphQLList(ioToGraphQLOutputType(type.type, `id[]`));
    if (type instanceof t.InterfaceType)
        return new GraphQLObjectType({
            name: uniqueId("GrelDALAutoDerivedOutputType"),
            fields: transform(
                type.props,
                (result: GraphQLFieldConfigMap<any, any>, val: t.Type<any>, key: string) => {
                    result[key] = {
                        type: ioToGraphQLOutputType(val, `id[${key}]`),
                    };
                },
                {},
            ),
        });
    throw new Error(
        `GraphQL type for ${id} could not be auto-derived. You will need to specify the mapped types yourself.`,
    );
}

export function ioToGraphQLScalarType(type: t.Type<any>): Maybe<GraphQLScalarType> {
    if (type instanceof t.StringType) return GraphQLString;
    if (type instanceof t.NumberType) return GraphQLFloat;
    if (type instanceof t.BooleanType) return GraphQLBoolean;
    return null;
}

export function ioToGraphQLInputType(type: t.Type<any>, id: string): GraphQLInputType {
    const scalar = ioToGraphQLScalarType(type);
    if (scalar) return scalar;
    if (type instanceof t.ArrayType) return GraphQLList(ioToGraphQLInputType(type.type, `id[]`));
    if (type instanceof t.InterfaceType)
        return new GraphQLInputObjectType({
            name: uniqueId("GrelDALAutoDerivedInputType"),
            fields: transform(
                type.props,
                (result: GraphQLInputFieldConfigMap, val: t.Type<any>, key: string) => {
                    result[key] = {
                        type: ioToGraphQLInputType(val, `id[${key}]`),
                    };
                },
                {},
            ),
        });
    throw new Error(
        `GraphQL type for ${id} could not be auto-derived. You will need to specify the mapped types yourself.`,
    );
}

export const deriveFieldOutputType = (field: MappedField) => ioToGraphQLOutputType(field.type, field.keyPath);

export const deriveFieldInputType = (field: MappedField) => ioToGraphQLInputType(field.type, field.keyPath);
