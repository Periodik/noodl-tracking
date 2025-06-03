import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const purchases = await prisma.purchaseBatch.findMany({
      include: {
        product: true,
        thawed_batches: true
      },
      orderBy: { purchase_date: 'desc' }
    })
    return NextResponse.json(purchases)
  } catch (error) {
    console.error('Error fetching purchases:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch purchases',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Creating purchase with data:', body)
    
    // Get product to calculate portions
    const product = await prisma.product.findUnique({
      where: { id: body.product_id }
    })
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    const portionCount = Math.floor(parseFloat(body.quantity_received) / product.portion_size)
    
    const purchase = await prisma.purchaseBatch.create({
      data: {
        product: {
          connect: { id: body.product_id }
        },
        purchase_date: new Date(body.purchase_date),
        best_before_date: new Date(body.best_before_date),
        quantity_received: parseFloat(body.quantity_received),
        quantity_unit: body.quantity_unit,
        portioned_count: portionCount,
        remaining_portions: portionCount,
        cost_per_unit: body.cost_per_unit ? parseFloat(body.cost_per_unit) : null,
        supplier: body.supplier || null,
        notes: body.notes || null
      },
      include: {
        product: true
      }
    })
    
    console.log('Purchase created successfully:', purchase)
    return NextResponse.json(purchase)
  } catch (error) {
    console.error('Error creating purchase:', error)
    return NextResponse.json({ 
      error: 'Failed to create purchase',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Updating purchase with data:', body)
    
    // Get product to recalculate portions
    const product = await prisma.product.findUnique({
      where: { id: body.product_id }
    })
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    const portionCount = Math.floor(parseFloat(body.quantity_received) / product.portion_size)
    
    const purchase = await prisma.purchaseBatch.update({
      where: { id: body.id },
      data: {
        purchase_date: new Date(body.purchase_date),
        best_before_date: new Date(body.best_before_date),
        quantity_received: parseFloat(body.quantity_received),
        quantity_unit: body.quantity_unit,
        portioned_count: portionCount,
        remaining_portions: parseInt(body.remaining_portions) || portionCount,
        cost_per_unit: body.cost_per_unit ? parseFloat(body.cost_per_unit) : null,
        supplier: body.supplier || null,
        notes: body.notes || null
      },
      include: {
        product: true
      }
    })
    
    return NextResponse.json(purchase)
  } catch (error) {
    console.error('Error updating purchase:', error)
    return NextResponse.json({ 
      error: 'Failed to update purchase',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}